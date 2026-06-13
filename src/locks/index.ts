/**
 * Named async locks.
 * Prevents duplicate concurrent operations: approvals, punishments, updates, config saves.
 *
 * Usage:
 *   await withLock('approval:123456', async () => { ... });
 */

const _locks = new Map<string, Promise<void>>();

/**
 * Acquire a named lock, run fn, then release.
 * If another call is already holding the lock, waits for it to finish.
 */
export async function withLock<T>(name: string, fn: () => Promise<T>): Promise<T> {
  // Wait for any existing lock on this name
  while (_locks.has(name)) {
    await _locks.get(name);
  }

  let release!: () => void;
  const lock = new Promise<void>((resolve) => { release = resolve; });
  _locks.set(name, lock);

  try {
    return await fn();
  } finally {
    _locks.delete(name);
    release();
  }
}

// ─── Convenience named locks ──────────────────────────────────────────────────

export const locks = {
  /** One approval action at a time per join-request flag */
  approval: (flag: string) => `approval:${flag}`,

  /** One punishment at a time per user-group pair */
  punishment: (groupId: number, userId: number) => `punishment:${groupId}:${userId}`,

  /** One update at a time globally */
  update: () => 'update:global',

  /** One config write at a time */
  config: () => 'config:write',
};
