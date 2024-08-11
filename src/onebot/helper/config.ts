import { ConfigBase } from '@/common/utils/ConfigBase';
import ob11DefaultConfig from '@/onebot/external/onebot11.json';

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export type OB11Config = typeof ob11DefaultConfig;

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class OB11ConfigLoader extends ConfigBase<OB11Config> {
    name = 'onebot11';
}
