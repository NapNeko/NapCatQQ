import { constants } from "node:os";
import path from "path";
import { dlopen } from "process";
import fs from "fs";
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
        let nativeNode = path.join(nodePath, './native/MoeHoo.win32.node');
        if (fs.existsSync(nativeNode)) {
            dlopen(this.MoeHooExport, nativeNode, constants.dlopen.RTLD_LAZY);
        }
    }
    isSetReCallEnabled(): boolean {
        return this.recallHookEnabled;
    }
    registerRecallCallback(callback: (hex: string) => any): void {
        try {
            if (this.MoeHooExport.exports?.registMsgPush) {
                this.MoeHooExport.exports.registMsgPush(callback);
                this.recallHookEnabled = true;
            }
        } catch (error) {
            this.recallHookEnabled = false;
        }
    }
}