import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { z } from 'zod';

export const NapcatConfigSchema = z.object({
    fileLog: z.boolean().default(false),
    consoleLog: z.boolean().default(true),
    fileLogLevel: z.string().default('debug'),
    consoleLogLevel: z.string().default('info'),
    packetBackend: z.string().default('auto'),
    packetServer: z.string().default(''),
    o3HookMode: z.number().default(0),
});

export type NapcatConfig = z.infer<typeof NapcatConfigSchema>;

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
    constructor(core: NapCatCore, configPath: string, schema: z.ZodType<any>) {
        super('napcat', core, configPath, schema);
    }
}