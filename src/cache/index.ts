import { LRUCache } from 'lru-cache';

/**
 * Three-tier cache:
 *   Tier 1 - Simple in-memory Map (hot items, no eviction)
 *   Tier 2 - LRU cache (bounded memory)
 *   Tier 3 - TTL cache (time-bounded, auto-expiry)
 *
 * Use the tier appropriate for each key:
 *   - Permissions, bot config → tier 1 (changed rarely, always needed)
 *   - Group/user info        → tier 2 (many keys, bounded)
 *   - Captchas, OCR/AI       → tier 3 (time-sensitive)
 */

// Tier 1: hot in-memory Map (permissions, plugin config)
const hot = new Map<string, unknown>();

// Tier 2: LRU (group info, user info, risk rules)
const lru = new LRUCache<string, unknown>({
  max: 2000,
  ttl: 300_000, // 5 min default TTL
});

// Tier 3: TTL (captcha sessions, OCR results, AI results)
const ttl = new LRUCache<string, unknown>({
  max: 500,
  ttl: 60_000, // 1 min default, overridden per entry
});

// ─── Tier 1 ───────────────────────────────────────────────────────────────────

export function hotSet<T>(key: string, value: T): void {
  hot.set(key, value);
}

export function hotGet<T>(key: string): T | undefined {
  return hot.get(key) as T | undefined;
}

export function hotDelete(key: string): void {
  hot.delete(key);
}

export function hotClear(): void {
  hot.clear();
}

// ─── Tier 2 (LRU) ────────────────────────────────────────────────────────────

export function lruSet<T>(key: string, value: T, ttlMs?: number): void {
  lru.set(key, value, ttlMs !== undefined ? { ttl: ttlMs } : undefined);
}

export function lruGet<T>(key: string): T | undefined {
  return lru.get(key) as T | undefined;
}

export function lruDelete(key: string): void {
  lru.delete(key);
}

// ─── Tier 3 (TTL) ────────────────────────────────────────────────────────────

export function ttlSet<T>(key: string, value: T, expiresInMs: number): void {
  ttl.set(key, value, { ttl: expiresInMs });
}

export function ttlGet<T>(key: string): T | undefined {
  return ttl.get(key) as T | undefined;
}

export function ttlDelete(key: string): void {
  ttl.delete(key);
}

// ─── Typed namespaced helpers ─────────────────────────────────────────────────

export const cache = {
  /** Permissions, config: never expire unless explicitly cleared */
  permissions: {
    set: (key: string, v: unknown) => hotSet(`perm:${key}`, v),
    get: <T>(key: string) => hotGet<T>(`perm:${key}`),
    clear: () => {
      for (const k of hot.keys()) if (k.startsWith('perm:')) hot.delete(k);
    },
  },
  /** Group info: LRU, 5 min TTL */
  groupInfo: {
    set: (groupId: number, v: unknown) => lruSet(`group:${groupId}`, v, 300_000),
    get: <T>(groupId: number) => lruGet<T>(`group:${groupId}`),
    clear: (groupId: number) => lruDelete(`group:${groupId}`),
  },
  /** Captcha sessions: TTL matching session TTL */
  captcha: {
    set: (id: string, v: unknown, ttlMs: number) => ttlSet(`cap:${id}`, v, ttlMs),
    get: <T>(id: string) => ttlGet<T>(`cap:${id}`),
    clear: (id: string) => ttlDelete(`cap:${id}`),
  },
  /** OCR results: 10 min TTL */
  ocr: {
    set: (hash: string, v: unknown) => ttlSet(`ocr:${hash}`, v, 600_000),
    get: <T>(hash: string) => ttlGet<T>(`ocr:${hash}`),
  },
  /** AI risk results: 10 min TTL */
  aiRisk: {
    set: (hash: string, v: unknown) => ttlSet(`ai:${hash}`, v, 600_000),
    get: <T>(hash: string) => ttlGet<T>(`ai:${hash}`),
  },
};
