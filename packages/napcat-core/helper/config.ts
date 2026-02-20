import { ConfigBase } from '@/napcat-core/helper/config-base';
import { NapCatCore } from '@/napcat-core/index';
import { Type, Static } from '@sinclair/typebox';
import Ajv, { AnySchema } from 'ajv';
import path from 'node:path';
import fs from 'node:fs';
import json5 from 'json5';

export const BypassOptionsSchema = Type.Object({
  hook: Type.Boolean({ default: true }),
  window: Type.Boolean({ default: true }),
  module: Type.Boolean({ default: true }),
  process: Type.Boolean({ default: true }),
  container: Type.Boolean({ default: true }),
  js: Type.Boolean({ default: true }),
});

export const NapcatConfigSchema = Type.Object({
  fileLog: Type.Boolean({ default: false }),
  consoleLog: Type.Boolean({ default: true }),
  fileLogLevel: Type.String({ default: 'debug' }),
  consoleLogLevel: Type.String({ default: 'info' }),
  packetBackend: Type.String({ default: 'auto' }),
  packetServer: Type.String({ default: '' }),
  o3HookMode: Type.Number({ default: 0 }),
  bypass: Type.Optional(BypassOptionsSchema),
});

export type NapcatConfig = Static<typeof NapcatConfigSchema>;

/**
 * 从指定配置目录读取 napcat.json，按 NapcatConfigSchema 校验并填充默认值
 * 用于登录前（无 NapCatCore 实例时）的早期配置读取
 */
export function loadNapcatConfig (configPath: string): NapcatConfig {
  const ajv = new Ajv({ useDefaults: true, coerceTypes: true });
  const validate = ajv.compile<NapcatConfig>(NapcatConfigSchema);
  let data: Record<string, unknown> = {};
  try {
    const configFile = path.join(configPath, 'napcat.json');
    if (fs.existsSync(configFile)) {
      data = json5.parse(fs.readFileSync(configFile, 'utf-8'));
    }
  } catch {
    // 读取失败时使用 schema 默认值
  }
  validate(data);
  return data as NapcatConfig;
}

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
  constructor (core: NapCatCore, configPath: string, schema: AnySchema) {
    super('napcat', core, configPath, schema);
  }
}
