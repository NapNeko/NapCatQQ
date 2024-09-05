import laanaConfig from './laana.json';
import { NapCatCore } from '@/core';
import { ConfigBase } from '@/common/config-base';

export type LaanaConfig = typeof laanaConfig;

export class LaanaConfigLoader extends ConfigBase<LaanaConfig> {
    constructor(core: NapCatCore, configPath: string) {
        super('laana', core, configPath);
    }
}
