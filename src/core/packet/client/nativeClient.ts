import crypto, { createHash } from "crypto";
import { NapCatCore } from "@/core";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { PacketClient } from "@/core/packet/client/client";
import { constants } from "node:os";
import { LRUCache } from "@/common/lru-cache";
//0 send 1recv
export interface NativePacketExportType {
    InitHook?: (recv: string, send: string, callback: (type: number, uin: string, cmd: string, seq: number, hex_data: string) => void) => boolean;
    SendPacket?: (cmd: string, data: string, trace_id: string) => void;
}
export class NativePacketClient extends PacketClient {
    private readonly supportedPlatforms = ['win32.x64','linux.x64'];
    private MoeHooExport: { exports: NativePacketExportType } = { exports: {} };
    private sendEvent = new LRUCache<number, string>(500);//seq->trace_id
    constructor(core: NapCatCore) {
        super(core);
    }

    get available(): boolean {
        return this.isAvailable;
    }

    check(): boolean {
        const platform = process.platform + '.' + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            this.logger.logWarn(`[Core] [Packet:Native] 不支持的平台: ${platform}`);
            return false;
        }
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/MoeHoo.' + platform + '.node');
        if (!fs.existsSync(moehoo_path)) {
            this.logger.logWarn(`[Core] [Packet:Native] 缺失运行时文件: ${moehoo_path}`);
            return false;
        }
        return true;
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        const platform = process.platform + '.' + process.arch;
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/MoeHoo.' + platform + '.node');
        process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);
        this.MoeHooExport.exports.InitHook?.(send, recv, (type: number, uin: string, cmd: string, seq: number, hex_data: string) => {
            const trace_id = createHash('md5').update(Buffer.from(hex_data, 'hex')).digest('hex');
            if (type === 0 && this.cb.get(trace_id + 'recv')) {
                //此时为send 提取seq
                this.sendEvent.put(seq, trace_id);
            }
            if (type === 1 && this.sendEvent.get(seq)) {
                //此时为recv 调用callback
                const trace_id = this.sendEvent.get(seq);
                const callback = this.cb.get(trace_id + 'recv');
                console.log('callback:', callback, trace_id);
                callback?.({ seq, cmd, hex_data });
            }

            // const callback = this.cb.get(createHash('md5').update(Buffer.from(hex_data, 'hex')).digest('hex') + (type === 0 ? 'send' : 'recv'));
            // if (callback) {
            //     callback({ seq, cmd, hex_data });
            // } else {
            //     this.logger.logError(`Callback not found for hex_data: ${hex_data}`);
            // }
            //console.log('type:', type, 'cmd:', cmd, 'trace_id:', trace_id);
        });
        this.isAvailable = true;
    }

    sendCommandImpl(cmd: string, data: string, trace_id: string): void {
        const trace_id_md5 = createHash('md5').update(trace_id).digest('hex');
        //console.log('sendCommandImpl:', cmd, data, trace_id_md5);
        this.MoeHooExport.exports.SendPacket?.(cmd, data, trace_id_md5);
        this.cb.get(trace_id_md5 + 'send')?.({ seq: 0, cmd, hex_data: '' });
    }

    connect(cb: () => void): Promise<void> {
        cb();
        return Promise.resolve();
    }
}
