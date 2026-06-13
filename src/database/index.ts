/**
 * Database layer using node:sqlite (Node.js 22.5+ built-in).
 * Zero native addon dependencies — no node-gyp required.
 */
import { DatabaseSync } from 'node:sqlite';
import { join } from 'path';
import { mkdirSync } from 'fs';
import { runMigrations } from './migrations/index.js';
import { getLogger } from '../core/logger/index.js';

const DB_FILENAME = 'qqadmin.db';
let _db: DatabaseSync | null = null;

export function openDatabase(dataDir: string): DatabaseSync {
  if (_db) return _db;

  mkdirSync(dataDir, { recursive: true });
  const dbPath = join(dataDir, DB_FILENAME);

  _db = new DatabaseSync(dbPath);
  _db.exec('PRAGMA journal_mode = WAL');
  _db.exec('PRAGMA foreign_keys = ON');
  _db.exec('PRAGMA busy_timeout = 5000');
  _db.exec('PRAGMA synchronous = NORMAL');

  runMigrations(_db);
  getLogger().info({ path: dbPath }, 'Database opened (node:sqlite)');
  return _db;
}

export function getDatabase(): DatabaseSync {
  if (!_db) throw new Error('Database not initialized. Call openDatabase() first.');
  return _db;
}

export function closeDatabase(): void {
  if (_db) { _db.close(); _db = null; }
}

export type { DatabaseSync as Database };
