import { ConfigBase } from "@/common/utils/config-base";
import napCatDefaultConfig from '@/core/external/napcat.json';
import { NapCatCore } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export type NapCatConfig = typeof napCatDefaultConfig;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class NapCatConfigLoader extends ConfigBase<NapCatConfig> {
    constructor(core: NapCatCore, configPath: string) {
        super('napcat', core, configPath);
    }
}
