import type Database from 'better-sqlite3';
import * as m001 from './001_initial.js';
import { getLogger } from '../../core/logger/index.js';

interface Migration {
  version: number;
  description: string;
  up: (db: Database.Database) => void;
  down: (db: Database.Database) => void;
}

const MIGRATIONS: Migration[] = [m001];

export function runMigrations(db: Database.Database): void {
  const log = getLogger().child({ module: 'migrations' });

  // Ensure the migrations tracking table exists first
  db.exec(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version    INTEGER PRIMARY KEY,
      applied_at INTEGER NOT NULL
    );
  `);

  const appliedVersions = new Set<number>(
    db
      .prepare('SELECT version FROM schema_migrations ORDER BY version')
      .all()
      .map((r: unknown) => (r as { version: number }).version)
  );

  const pending = MIGRATIONS.filter((m) => !appliedVersions.has(m.version));
  if (pending.length === 0) {
    log.info('Database schema is up to date');
    return;
  }

  for (const migration of pending) {
    log.info({ version: migration.version }, `Applying migration: ${migration.description}`);
    const apply = db.transaction(() => {
      migration.up(db);
      db.prepare('INSERT OR IGNORE INTO schema_migrations (version, applied_at) VALUES (?, ?)').run(
        migration.version,
        Date.now()
      );
    });
    apply();
    log.info({ version: migration.version }, 'Migration applied');
  }
}

export function rollbackMigration(db: Database.Database, toVersion: number): void {
  const log = getLogger().child({ module: 'migrations' });

  const appliedVersions: number[] = db
    .prepare('SELECT version FROM schema_migrations ORDER BY version DESC')
    .all()
    .map((r: unknown) => (r as { version: number }).version);

  const toRollback = appliedVersions.filter((v) => v > toVersion);
  for (const version of toRollback) {
    const migration = MIGRATIONS.find((m) => m.version === version);
    if (!migration) {
      log.warn({ version }, 'No migration found for rollback');
      continue;
    }
    log.info({ version }, `Rolling back migration: ${migration.description}`);
    const revert = db.transaction(() => {
      migration.down(db);
      db.prepare('DELETE FROM schema_migrations WHERE version = ?').run(version);
    });
    revert();
    log.info({ version }, 'Rollback complete');
  }
}

export function validateSchema(db: Database.Database): boolean {
  try {
    const applied = db
      .prepare('SELECT COUNT(*) as cnt FROM schema_migrations')
      .get() as { cnt: number };
    return applied.cnt === MIGRATIONS.length;
  } catch {
    return false;
  }
}
