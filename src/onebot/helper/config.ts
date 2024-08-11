import { ConfigBase } from '@/common/utils/ConfigBase';
import ob11DefaultConfig from '@/onebot/external/onebot11.json';
import { NapCatCore } from '@/core';

export type OB11Config = typeof ob11DefaultConfig;

export class OB11ConfigLoader extends ConfigBase<OB11Config> {
    constructor(coreContext: NapCatCore, configPath: string) {
        super('onebot11', coreContext, configPath);
    }
}
