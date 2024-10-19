import { constants } from "node:os";
import path from "path";
import { dlopen } from "process";
import fs from "fs";
export class Native {
    platform: string;
    supportedPlatforms = [''];
    MoeHooExport: any = { exports: {} };
    recallHookEnabled: boolean = false;
    inited = true;
    constructor(nodePath: string, platform: string = process.platform) {
        this.platform = platform;
        try {
            if (!this.supportedPlatforms.includes(this.platform)) {
                throw new Error(`Platform ${this.platform} is not supported`);
            }
            const nativeNode = path.join(nodePath, './native/MoeHoo.win32.node');
            if (fs.existsSync(nativeNode)) {
                dlopen(this.MoeHooExport, nativeNode, constants.dlopen.RTLD_LAZY);
            }
        } catch (error) {
            this.inited = false;
        }

    }
    isSetReCallEnabled(): boolean {
        return this.recallHookEnabled && this.inited;
    }
    registerRecallCallback(callback: (hex: string) => any): void {
        try {
            if (!this.inited) throw new Error('Native Not Init');
            if (this.MoeHooExport.exports?.registMsgPush) {
                this.MoeHooExport.exports.registMsgPush(callback);
                this.recallHookEnabled = true;
            }
        } catch (error) {
            this.recallHookEnabled = false;
        }
    }
}