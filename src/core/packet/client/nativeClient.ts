import { createHash } from 'crypto';
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
    InitHook?: (send: string, recv: string, callback: (type: number, uin: string, cmd: string, seq: number, hex_data: string) => void, o3_hook: boolean) => boolean;
    SendPacket?: (cmd: string, data: string, trace_id: string) => void;
}

export class NativePacketClient extends IPacketClient {
    private readonly supportedPlatforms = ['win32.x64', 'linux.x64', 'linux.arm64', 'darwin.x64', 'darwin.arm64'];
    private readonly MoeHooExport: { exports: NativePacketExportType } = { exports: {} };
    private readonly sendEvent = new Map<number, string>(); // seq - hash
    private readonly timeEvent = new Map<string, NodeJS.Timeout>(); // hash - timeout

    constructor(napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) {
        super(napCore, logger, logStack);
    }

    check(): boolean {
        const platform = process.platform + '.' + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            this.logStack.pushLogWarn(`NativePacketClient: 不支持的平台: ${platform}`);
            return false;
        }
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/MoeHoo.' + platform + '.node');
        if (!fs.existsSync(moehoo_path)) {
            this.logStack.pushLogWarn(`NativePacketClient: 缺失运行时文件: ${moehoo_path}`);
            return false;
        }
        return true;
    }

    async init(_pid: number, recv: string, send: string): Promise<void> {
        const platform = process.platform + '.' + process.arch;
        const isNewQQ = this.napcore.basicInfo.requireMinNTQQBuild("36580");
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/MoeHoo.' + platform + (isNewQQ ? '.new' : '') + '.node');
        process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);

        this.MoeHooExport.exports.InitHook?.(send, recv, (type: number, _uin: string, cmd: string, seq: number, hex_data: string) => {
            const hash = createHash('md5').update(Buffer.from(hex_data, 'hex')).digest('hex');
            if (type === 0 && this.cb.get(hash + 'recv')) {
                //此时为send 提取seq
                this.sendEvent.set(seq, hash);
                setTimeout(() => {
                    this.sendEvent.delete(seq);
                    this.timeEvent.delete(hash);
                }, +(this.timeEvent.get(hash) ?? 20000));
                //正式send完成 无recv v
                //均无异常 v
            }
            if (type === 1 && this.sendEvent.get(seq)) {
                const hash = this.sendEvent.get(seq);
                const callback = this.cb.get(hash + 'recv');
                callback?.({ seq, cmd, hex_data });
            }
        }, this.napcore.config.o3HookMode == 1);
        this.available = true;
    }

    sendCommandImpl(cmd: string, data: string, hash: string, timeout: number): void {
        this.timeEvent.set(hash, setTimeout(() => {
            this.timeEvent.delete(hash);//考虑情况为正式send都没进
        }, timeout));
        this.MoeHooExport.exports.SendPacket?.(cmd, data, hash);
        this.cb.get(hash + 'send')?.({ seq: 0, cmd, hex_data: '' });
    }
}
