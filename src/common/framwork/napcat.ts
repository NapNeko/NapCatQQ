import path, { dirname } from "path";
import { fileURLToPath } from "url";

class NapCatPathWrapper {
    NapCat_Main_Path: string | undefined;
    NapCat_Logs_Path: string | undefined;
    NapCat_Config_Path: string | undefined;
    constructor() { }
    Init(MainPath: string = dirname(fileURLToPath(import.meta.url))) {
        this.NapCat_Main_Path = MainPath;
        this.NapCat_Logs_Path = path.join(this.NapCat_Main_Path, "logs");
        this.NapCat_Config_Path = path.join(this.NapCat_Main_Path, "config");
    }
    getScriptPath() {
        return this.NapCat_Main_Path;
    }
    getLogsPath() {
        return this.NapCat_Logs_Path;
    }
    getConfigPath() {
        return this.NapCat_Config_Path;
    }
}
export let NapCatPath: NapCatPathWrapper | undefined;