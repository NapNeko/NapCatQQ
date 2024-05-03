import { LogLevel } from '@/common/utils/log';
import { ConfigBase } from '@/common/utils/ConfigBase';
export interface NapCatConfig {
    fileLog: boolean;
    consoleLog: boolean;
    fileLogLevel: LogLevel;
    consoleLogLevel: LogLevel;
}
declare class Config extends ConfigBase<NapCatConfig> implements NapCatConfig {
    fileLog: boolean;
    consoleLog: boolean;
    fileLogLevel: LogLevel;
    consoleLogLevel: LogLevel;
    constructor();
    getConfigPath(): string;
}
export declare const napCatConfig: Config;
export {};
