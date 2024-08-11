import { ConfigBase } from "@/common/utils/ConfigBase";
import napCatDefaultConfig from '@/core/external/napcat.json';
import { NapCatCore } from '@/core';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export type NapCatConfig = typeof napCatDefaultConfig;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class NapCatConfigLoader extends ConfigBase<NapCatConfig> {
    constructor(coreContext: NapCatCore, configPath: string) {
        super('napcat', coreContext, configPath);
    }
}
