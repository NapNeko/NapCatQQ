import path, { dirname } from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import { IPacketClient } from '@/core/packet/client/baseClient';
import { constants } from 'node:os';
import { LogStack } from '@/core/packet/context/clientContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';

// 0 send 1 recv
export interface NativePacketExportType {
    initHook?: (send: string, recv: string) => boolean;
}

export class NativePacketClient extends IPacketClient {
    private readonly supportedPlatforms = ['win32.x64', 'linux.x64', 'linux.arm64', 'darwin.x64', 'darwin.arm64'];
    private readonly MoeHooExport: { exports: NativePacketExportType } = { exports: {} };
    constructor(napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) {
        super(napCore, logger, logStack);
    }

    check(): boolean {
        const platform = process.platform + '.' + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            this.logStack.pushLogWarn(`NativePacketClient: 不支持的平台: ${platform}`);
            return false;
        }
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/napi2native.' + platform + '.node');
        if (!fs.existsSync(moehoo_path)) {
            this.logStack.pushLogWarn(`NativePacketClient: 缺失运行时文件: ${moehoo_path}`);
            return false;
        }
        return true;
    }

    async init(_pid: number, recv: string, send: string): Promise<void> {
        const platform = process.platform + '.' + process.arch;
        const isNewQQ = this.napcore.basicInfo.requireMinNTQQBuild("40824");
        if (isNewQQ) {
            const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/napi2native.' + platform + '.node');
            process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);
            this.MoeHooExport?.exports.initHook?.(send, recv);
            this.available = true;
        }
    }
}
