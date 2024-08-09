import path, { dirname } from "path";
import { fileURLToPath } from "url";
export const napcat_version = "2.0.0";
export class NapCatPathWrapper {
    binaryPath: string;
    logsPath: string;
    configPath: string;

    constructor(mainPath: string = dirname(fileURLToPath(import.meta.url))) {
        this.binaryPath = mainPath;
        this.logsPath = path.join(this.binaryPath, "logs");
        this.configPath = path.join(this.binaryPath, "config");
    }
}
