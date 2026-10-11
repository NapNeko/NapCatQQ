import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { migrateLegacyGlobalPath } from '@/napcat-shell/global-migrate';

const noopLogger = { log: () => {}, logError: () => {} };

function withTempDir (fn: (dir: string) => void): void {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'napcat-migrate-test-'));
  try {
    fn(dir);
  } finally {
    fs.rmSync(dir, { recursive: true, force: true });
  }
}

describe('Linux legacy global migration', () => {
  it('moves nt_qq/global to global when the new path is absent', () => {
    withTempDir((dir) => {
      const legacy = path.join(dir, 'nt_qq', 'global');
      fs.mkdirSync(path.join(legacy, 'nt_data', 'msf'), { recursive: true });
      fs.writeFileSync(path.join(legacy, 'nt_data', 'msf', 'machine-info'), Buffer.from('legacy-creds'));
      const target = path.join(dir, 'global');

      expect(migrateLegacyGlobalPath(dir, target, noopLogger, 'linux')).toBe(true);
      expect(fs.existsSync(legacy)).toBe(false);
      expect(fs.readFileSync(path.join(target, 'nt_data', 'msf', 'machine-info')).toString())
        .toBe('legacy-creds');
    });
  });

  it('does nothing when the new global path already exists (keeps both intact)', () => {
    withTempDir((dir) => {
      const legacy = path.join(dir, 'nt_qq', 'global');
      const target = path.join(dir, 'global');
      fs.mkdirSync(legacy, { recursive: true });
      fs.mkdirSync(target, { recursive: true });
      fs.writeFileSync(path.join(legacy, 'marker'), Buffer.from('legacy'));
      fs.writeFileSync(path.join(target, 'marker'), Buffer.from('new'));

      expect(migrateLegacyGlobalPath(dir, target, noopLogger, 'linux')).toBe(false);
      expect(fs.readFileSync(path.join(legacy, 'marker')).toString()).toBe('legacy');
      expect(fs.readFileSync(path.join(target, 'marker')).toString()).toBe('new');
    });
  });

  it('does nothing when neither path exists', () => {
    withTempDir((dir) => {
      expect(migrateLegacyGlobalPath(dir, path.join(dir, 'global'), noopLogger, 'linux')).toBe(false);
      expect(fs.existsSync(path.join(dir, 'global'))).toBe(false);
    });
  });

  it('is idempotent across repeated startups', () => {
    withTempDir((dir) => {
      const legacy = path.join(dir, 'nt_qq', 'global');
      fs.mkdirSync(legacy, { recursive: true });
      fs.writeFileSync(path.join(legacy, 'login.db'), Buffer.from('creds'));
      const target = path.join(dir, 'global');

      expect(migrateLegacyGlobalPath(dir, target, noopLogger, 'linux')).toBe(true);
      expect(migrateLegacyGlobalPath(dir, target, noopLogger, 'linux')).toBe(false);
      expect(fs.readFileSync(path.join(target, 'login.db')).toString()).toBe('creds');
    });
  });

  it('never touches non-Linux platforms', () => {
    withTempDir((dir) => {
      const legacy = path.join(dir, 'nt_qq', 'global');
      fs.mkdirSync(legacy, { recursive: true });
      expect(migrateLegacyGlobalPath(dir, path.join(dir, 'global'), noopLogger, 'win32')).toBe(false);
      expect(fs.existsSync(legacy)).toBe(true);
    });
  });
});
