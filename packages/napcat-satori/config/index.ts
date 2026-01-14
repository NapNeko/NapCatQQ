import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import json5 from 'json5';
import { SatoriConfig, SatoriConfigSchema, loadSatoriConfig } from './config';
import { NapCatCore } from 'napcat-core';
import { Static, TSchema } from '@sinclair/typebox';

export class SatoriConfigLoader<T extends TSchema = typeof SatoriConfigSchema> {
  public configData: Static<T>;
  private configPath: string;
  private core: NapCatCore;

  constructor (core: NapCatCore, configBasePath: string, _schema: T) {
    this.core = core;
    const configFileName = `satori_${core.selfInfo.uin}.json`;
    this.configPath = `${configBasePath}/${configFileName}`;
    this.configData = this.loadConfig();
  }

  private loadConfig (): Static<T> {
    let configData: Partial<Static<T>> = {};

    if (existsSync(this.configPath)) {
      try {
        const fileContent = readFileSync(this.configPath, 'utf-8');
        configData = json5.parse(fileContent);
      } catch (e) {
        this.core.context.logger.logError('[Satori] 配置文件解析失败，使用默认配置', e);
      }
    }

    const loadedConfig = loadSatoriConfig(configData as Partial<SatoriConfig>) as Static<T>;
    this.save(loadedConfig);
    return loadedConfig;
  }

  public save (config: Static<T>): void {
    this.configData = config;
    const dir = dirname(this.configPath);
    if (!existsSync(dir)) {
      mkdirSync(dir, { recursive: true });
    }
    writeFileSync(this.configPath, JSON.stringify(config, null, 2), 'utf-8');
  }

  public reload (): Static<T> {
    if (existsSync(this.configPath)) {
      try {
        const fileContent = readFileSync(this.configPath, 'utf-8');
        this.configData = loadSatoriConfig(json5.parse(fileContent)) as Static<T>;
      } catch (e) {
        this.core.context.logger.logError('[Satori] 配置文件重载失败', e);
      }
    }
    return this.configData;
  }
}

export * from './config';
