/**
 * Three-tier cache — pure TypeScript, zero npm dependencies.
 *
 * Tier 1 (hot)  – plain Map, never evicted unless cleared explicitly.
 * Tier 2 (lru)  – bounded LRU with optional per-entry TTL.
 * Tier 3 (ttl)  – time-bounded map, auto-expires on read.
 */

// ─── Minimal LRU Cache ────────────────────────────────────────────────────────
// Replaces the 'lru-cache' npm package with a self-contained implementation.

interface LRUEntry<V> { value: V; ts: number; ttl: number; }

class LRUCache<K, V> {
  private readonly max: number;
  private readonly defaultTTL: number;
  private map: Map<K, LRUEntry<V>>;

  constructor(opts: { max?: number; ttl?: number } = {}) {
    this.max        = opts.max ?? 500;
    this.defaultTTL = opts.ttl ?? 0;
    this.map        = new Map();
  }

  set(key: K, value: V, opts?: { ttl?: number }): void {
    if (this.map.size >= this.max) {
      const oldest = this.map.keys().next().value;
      if (oldest !== undefined) this.map.delete(oldest);
    }
    this.map.set(key, { value, ts: Date.now(), ttl: opts?.ttl ?? this.defaultTTL });
  }

  get(key: K): V | undefined {
    const entry = this.map.get(key);
    if (!entry) return undefined;
    if (entry.ttl > 0 && Date.now() - entry.ts > entry.ttl) {
      this.map.delete(key);
      return undefined;
    }
    // Move to end (most-recently-used)
    this.map.delete(key);
    this.map.set(key, entry);
    return entry.value;
  }

  delete(key: K): void { this.map.delete(key); }
  has(key: K): boolean { return this.map.has(key); }
  keys(): IterableIterator<K> { return this.map.keys(); }
  get size(): number { return this.map.size; }
}

// ─── Tier 1: hot Map ─────────────────────────────────────────────────────────
const hot = new Map<string, unknown>();

export function hotSet<T>(key: string, value: T): void  { hot.set(key, value); }
export function hotGet<T>(key: string): T | undefined   { return hot.get(key) as T; }
export function hotDelete(key: string): void            { hot.delete(key); }
export function hotClear(): void                        { hot.clear(); }

// ─── Tier 2: LRU ─────────────────────────────────────────────────────────────
const lru = new LRUCache<string, unknown>({ max: 2000, ttl: 300_000 });

export function lruSet<T>(key: string, value: T, ttlMs?: number): void {
  lru.set(key, value, ttlMs !== undefined ? { ttl: ttlMs } : undefined);
}
export function lruGet<T>(key: string): T | undefined { return lru.get(key) as T; }
export function lruDelete(key: string): void          { lru.delete(key); }

// ─── Tier 3: TTL ─────────────────────────────────────────────────────────────
const ttlCache = new LRUCache<string, unknown>({ max: 500, ttl: 60_000 });

export function ttlSet<T>(key: string, value: T, expiresInMs: number): void {
  ttlCache.set(key, value, { ttl: expiresInMs });
}
export function ttlGet<T>(key: string): T | undefined { return ttlCache.get(key) as T; }
export function ttlDelete(key: string): void          { ttlCache.delete(key); }

// ─── Typed namespaced helpers ─────────────────────────────────────────────────
export const cache = {
  permissions: {
    set: (key: string, v: unknown) => hotSet(`perm:${key}`, v),
    get: <T>(key: string)          => hotGet<T>(`perm:${key}`),
    clear: () => {
      for (const k of hot.keys()) if (k.startsWith('perm:')) hot.delete(k);
    },
  },
  groupInfo: {
    set: (groupId: number, v: unknown) => lruSet(`group:${groupId}`, v, 300_000),
    get: <T>(groupId: number)          => lruGet<T>(`group:${groupId}`),
    clear: (groupId: number)           => lruDelete(`group:${groupId}`),
  },
  captcha: {
    set: (id: string, v: unknown, ttlMs: number) => ttlSet(`cap:${id}`, v, ttlMs),
    get: <T>(id: string)                         => ttlGet<T>(`cap:${id}`),
    clear: (id: string)                          => ttlDelete(`cap:${id}`),
  },
  ocr: {
    set: (hash: string, v: unknown) => ttlSet(`ocr:${hash}`, v, 600_000),
    get: <T>(hash: string)          => ttlGet<T>(`ocr:${hash}`),
  },
  aiRisk: {
    set: (hash: string, v: unknown) => ttlSet(`ai:${hash}`, v, 600_000),
    get: <T>(hash: string)          => ttlGet<T>(`ai:${hash}`),
  },
};
