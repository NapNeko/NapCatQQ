import { constants } from "node:os";
import path from "path";
import { dlopen } from "process";
export class Native {
    platform: string;
    supportedPlatforms = ['win32'];
    MoeHooExport: any = { exports: {} };
    recallHookEnabled: boolean = false;
    constructor(nodePath: string, platform: string = process.platform) {
        this.platform = platform;
        if (!this.supportedPlatforms.includes(this.platform)) {
            throw new Error(`Platform ${this.platform} is not supported`);
        }
        dlopen(this.MoeHooExport, path.join(nodePath, './native/MoeHoo.win32.node'), constants.dlopen.RTLD_LAZY);
    }
    isSetReCallEnabled(): boolean {
        return this.recallHookEnabled;
    }
    registerRecallCallback(callback: (hex: string) => any): void {
        this.recallHookEnabled = true;
        return this.MoeHooExport.exports.registMsgPush(callback);
    }
}