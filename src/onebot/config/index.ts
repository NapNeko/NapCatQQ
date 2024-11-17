import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { OneBotConfig } from './config';

export class OB11ConfigLoader extends ConfigBase<OneBotConfig> {
    constructor(core: NapCatCore, configPath: string) {
        super('onebot11', core, configPath, false);
    }
}
