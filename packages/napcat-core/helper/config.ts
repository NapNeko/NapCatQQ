import { ConfigBase } from '@/napcat-core/helper/config-base';
import { NapCatCore } from '@/napcat-core/index';
import { Type, Static } from '@sinclair/typebox';
import { AnySchema } from 'ajv';

export const BypassOptionsSchema = Type.Object({
  hook: Type.Boolean({ default: true }),
  module: Type.Boolean({ default: true }),
  window: Type.Boolean({ default: true }),
  js: Type.Boolean({ default: true }),
  container: Type.Boolean({ default: true }),
  maps: Type.Boolean({ default: true }),
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

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
  constructor (core: NapCatCore, configPath: string, schema: AnySchema) {
    super('napcat', core, configPath, schema);
  }
}
