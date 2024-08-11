import { ConfigBase } from "@/common/utils/ConfigBase";
import { LogLevel } from "@/common/utils/log";

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export interface NapCatConfig {
    fileLog: boolean,
    consoleLog: boolean,
    fileLogLevel: LogLevel,
    consoleLogLevel: LogLevel,
}

// eslint-disable-next-line @typescript-eslint/no-unsafe-declaration-merging
export class NapCatConfig extends ConfigBase<NapCatConfig> {
    getConfigName() {
        return 'napcat';
    }
}
