import { readFileSync, writeFileSync, existsSync, mkdirSync, copyFileSync } from 'fs';
import { join, dirname } from 'path';
import type { PluginConfig } from './types.js';
import { buildDefaults } from './defaults.js';
import { bus } from '../../events/index.js';

const CONFIG_FILE = 'config.json';
const BACKUP_DIR = 'config-backups';
const CURRENT_SCHEMA_VERSION = 1;

interface ConfigFile {
  schemaVersion: number;
  config: PluginConfig;
}

class ConfigManager {
  private cfg!: PluginConfig;
  private configPath!: string;
  private backupDir!: string;

  init(configDir: string): void {
    this.configPath = join(configDir, CONFIG_FILE);
    this.backupDir = join(configDir, BACKUP_DIR);
    mkdirSync(this.backupDir, { recursive: true });

    if (existsSync(this.configPath)) {
      this.cfg = this.load();
    } else {
      this.cfg = buildDefaults(configDir);
      this.save();
    }
  }

  get(): PluginConfig {
    return this.cfg;
  }

  update(partial: Partial<PluginConfig>): void {
    const previous = JSON.stringify(this.cfg);
    this.cfg = deepMerge(this.cfg, partial) as PluginConfig;
    if (JSON.stringify(this.cfg) !== previous) {
      this.backup();
      this.save();
      bus.emit('ConfigChanged', { section: 'config', timestamp: Date.now() });
    }
  }

  private load(): PluginConfig {
    const raw = readFileSync(this.configPath, 'utf8');
    const parsed: ConfigFile = JSON.parse(raw);
    return this.migrate(parsed);
  }

  private save(): void {
    const file: ConfigFile = {
      schemaVersion: CURRENT_SCHEMA_VERSION,
      config: this.cfg,
    };
    writeFileSync(this.configPath, JSON.stringify(file, null, 2), 'utf8');
  }

  private backup(): void {
    if (!existsSync(this.configPath)) return;
    const ts = new Date().toISOString().replace(/[:.]/g, '-');
    const dest = join(this.backupDir, `config-${ts}.json`);
    try {
      copyFileSync(this.configPath, dest);
    } catch {
      // Non-fatal: backup failure should not block operation
    }
  }

  private migrate(file: ConfigFile): PluginConfig {
    const version = file.schemaVersion ?? 0;
    let cfg = file.config;

    // Version migrations: add future migrations here
    if (version < 1) {
      // Initial version - nothing to migrate
    }

    // Fill in any missing keys from defaults
    const defaults = buildDefaults(cfg?.core?.dataDir ?? '.');
    return deepMerge(defaults, cfg) as PluginConfig;
  }
}

function deepMerge(target: unknown, source: unknown): unknown {
  if (source === null || source === undefined) return target;
  if (typeof source !== 'object' || Array.isArray(source)) return source;
  if (typeof target !== 'object' || Array.isArray(target)) return source;

  const result = { ...(target as Record<string, unknown>) };
  for (const [k, v] of Object.entries(source as Record<string, unknown>)) {
    result[k] = deepMerge(result[k], v);
  }
  return result;
}

export const configManager = new ConfigManager();
