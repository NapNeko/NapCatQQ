import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { z } from 'zod';

export const NapcatConfigSchema = z.object({
    fileLog: z.coerce.boolean().default(false),
    consoleLog: z.coerce.boolean().default(true),
    fileLogLevel: z.coerce.string().default('debug'),
    consoleLogLevel: z.coerce.string().default('info'),
    packetBackend: z.coerce.string().default('auto'),
    packetServer: z.coerce.string().default(''),
    o3HookMode: z.coerce.number().default(0),
});

export type NapcatConfig = z.infer<typeof NapcatConfigSchema>;

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
    constructor(core: NapCatCore, configPath: string, schema: z.ZodType<any>) {
        super('napcat', core, configPath, schema);
    }
}