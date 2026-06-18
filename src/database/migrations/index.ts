import { DatabaseSync } from 'node:sqlite';
import * as m001 from './001_initial.js';
import { getLogger } from '../../core/logger/index.js';

interface Migration {
  version: number;
  description: string;
  up:   (db: DatabaseSync) => void;
  down: (db: DatabaseSync) => void;
}

const MIGRATIONS: Migration[] = [m001];

export function runMigrations(db: DatabaseSync): void {
  const log = getLogger().child({ module: 'migrations' });

  // Bootstrap the tracking table first
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

  const applied = new Set<number>(
    (db.prepare('SELECT version FROM schema_migrations ORDER BY version').all() as Array<{version:number}>)
      .map(r => r.version)
  );

  const pending = MIGRATIONS.filter(m => !applied.has(m.version));
  if (pending.length === 0) { log.info('Schema up to date'); return; }

  for (const migration of pending) {
    log.info({ version: migration.version }, `Applying: ${migration.description}`);
    // node:sqlite: use explicit transaction (no db.transaction() helper)
    db.exec('BEGIN');
    try {
      migration.up(db);
      db.prepare(
        'INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)'
      ).run(migration.version, Date.now());
      db.exec('COMMIT');
      log.info({ version: migration.version }, 'Applied ✓');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}

export function rollbackMigration(db: DatabaseSync, toVersion: number): void {
  const log = getLogger().child({ module: 'migrations' });
  const versions = (
    db.prepare('SELECT version FROM schema_migrations ORDER BY version DESC').all() as Array<{version:number}>
  ).map(r => r.version).filter(v => v > toVersion);

  for (const version of versions) {
    const migration = MIGRATIONS.find(m => m.version === version);
    if (!migration) { log.warn({ version }, 'No migration for rollback'); continue; }
    log.info({ version }, `Rolling back: ${migration.description}`);
    db.exec('BEGIN');
    try {
      migration.down(db);
      db.prepare('DELETE FROM schema_migrations WHERE version = ?').run(version);
      db.exec('COMMIT');
    } catch (e) {
      db.exec('ROLLBACK');
      throw e;
    }
  }
}
