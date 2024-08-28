import { ConfigBase } from '@/common/config-base';
import ob11DefaultConfig from './onebot11.json';
import { NapCatCore } from '@/core';

export type OB11Config = typeof ob11DefaultConfig;

export class OB11ConfigLoader extends ConfigBase<OB11Config> {
    constructor(core: NapCatCore, configPath: string) {
        super('onebot11', core, configPath);
    }
}
