import BetterSqlite3, { type Database as BetterDB } from 'better-sqlite3';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { runMigrations } from './migrations/index.js';
import { getLogger } from '../core/logger/index.js';

const DB_FILENAME = 'qqadmin.db';

let _db: BetterDB | null = null;

export function openDatabase(dataDir: string): BetterDB {
  if (_db) return _db;

  mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, DB_FILENAME);

  _db = new BetterSqlite3(dbPath);
  _db.pragma('journal_mode = WAL');
  _db.pragma('foreign_keys = ON');
  _db.pragma('busy_timeout = 5000');
  _db.pragma('synchronous = NORMAL');

  runMigrations(_db);

  getLogger().info({ path: dbPath }, 'Database opened');
  return _db;
}

export function getDatabase(): BetterDB {
  if (!_db) throw new Error('Database not initialized. Call openDatabase() first.');
  return _db;
}

export function closeDatabase(): void {
  if (_db) {
    _db.close();
    _db = null;
    getLogger().info('Database closed');
  }
}

export type { BetterDB as Database };
