import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { coerce } from '@/common/coerce';
import { z } from 'zod';

export const NapcatConfigSchema = z.object({
    fileLog: coerce.boolean().default(false),
    consoleLog: coerce.boolean().default(true),
    fileLogLevel: coerce.string().default('debug'),
    consoleLogLevel: coerce.string().default('info'),
    packetBackend: coerce.string().default('auto'),
    packetServer: coerce.string().default(''),
    o3HookMode: coerce.number().default(0),
});

export type NapcatConfig = z.infer<typeof NapcatConfigSchema>;

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
    constructor(core: NapCatCore, configPath: string, schema: z.ZodType<any>) {
        super('napcat', core, configPath, schema);
    }
}