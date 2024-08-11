import { ConfigBase } from "@/common/utils/ConfigBase";
import { LogLevel } from "@/common/utils/log";
import napCatDefaultConfig from '@/core/external/napcat.json';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export type NapCatConfig = typeof napCatDefaultConfig;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class NapCatConfigLoader extends ConfigBase<NapCatConfig> {
    name = 'napcat';
}
