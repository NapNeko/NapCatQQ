import { ConfigBase } from "@/common/utils/ConfigBase";
import { LogLevel } from "@/common/utils/log";

export interface NapCatConfig {
    fileLog: boolean,
    consoleLog: boolean,
    fileLogLevel: LogLevel,
    consoleLogLevel: LogLevel,
}

export class NapCatConfig extends ConfigBase<NapCatConfig> {
    getConfigName() {
        return 'onebot11';
    }

}