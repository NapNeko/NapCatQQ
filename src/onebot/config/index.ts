import { ConfigBase } from '@/common/config-base';
import { NapCatCore } from '@/core';
import { OnebotConfig } from './config';

export class OB11ConfigLoader extends ConfigBase<OnebotConfig> {
    constructor(core: NapCatCore, configPath: string) {
        super('onebot11', core, configPath, false);
    }
}
