import { ConfigBase } from '@/common/utils/config-base';
import napCatDefaultConfig from '@/core/external/napcat.json';
import { NapCatCore } from '@/core';

export type NapCatConfig = typeof napCatDefaultConfig;

export class NapCatConfigLoader extends ConfigBase<NapCatConfig> {
    constructor(core: NapCatCore, configPath: string) {
        super('napcat', core, configPath);
    }
}
