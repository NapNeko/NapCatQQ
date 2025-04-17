import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { actionType } from '@/common/coerce';
import { z } from 'zod';

export const NapcatConfigSchema = z.object({
    fileLog: actionType.boolean().default(false),
    consoleLog: actionType.boolean().default(true),
    fileLogLevel: actionType.string().default('debug'),
    consoleLogLevel: actionType.string().default('info'),
    packetBackend: actionType.string().default('auto'),
    packetServer: actionType.string().default(''),
    o3HookMode: actionType.number().default(0),
});

export type NapcatConfig = z.infer<typeof NapcatConfigSchema>;

export class NapCatConfigLoader extends ConfigBase<NapcatConfig> {
    constructor(core: NapCatCore, configPath: string, schema: z.ZodType<any>) {
        super('napcat', core, configPath, schema);
    }
}