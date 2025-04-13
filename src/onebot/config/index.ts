import { ConfigBase } from '@/common/config-base';
import type { NapCatCore } from '@/core';
import { OneBotConfig } from './config';
import { z } from 'zod';


export class OB11ConfigLoader extends ConfigBase<OneBotConfig> {
    constructor(core: NapCatCore, configPath: string, schema: z.ZodType<OneBotConfig>) {
        super('onebot11', core, configPath, schema);
    }
}
