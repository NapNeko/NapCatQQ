import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { Type, Static } from '@sinclair/typebox';
import { AnySchema } from 'ajv';

export const NapcatConfigSchema = Type.Object({
    fileLog: Type.Boolean({ default: false }),
    consoleLog: Type.Boolean({ default: true }),
    fileLogLevel: Type.String({ default: 'debug' }),
    consoleLogLevel: Type.String({ default: 'info' }),
    packetBackend: Type.String({ default: 'auto' }),
    packetServer: Type.String({ default: '' }),
    o3HookMode: Type.Number({ default: 0 }),
});

export type NapcatConfig = Static<typeof NapcatConfigSchema>;

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
    constructor(core: NapCatCore, configPath: string, schema: AnySchema) {
        super('napcat', core, configPath, schema);
    }
}
