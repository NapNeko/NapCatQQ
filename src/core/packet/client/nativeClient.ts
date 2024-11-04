import crypto, { createHash } from "crypto";
import { NapCatCore } from "@/core";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { console } from "inspector";
import { PacketClient } from "@/core/packet/client/client";
import { constants, platform, type } from "node:os";
import { LogWrapper } from "@/common/log";

export class NativePacketClient extends PacketClient {
    static supportedPlatforms = ['win32.x64'];
    private MoeHooExport: any = { exports: {} };

    protected constructor(core: NapCatCore) {
        super(core);
    }

    get available(): boolean {
        return this.isAvailable;
    }

    static compatibilityScore(logger: LogWrapper): number {
        const platform = process.platform + '.' + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            logger.logError(`[NativePacketClient] Unsupported platform: ${platform}`);
            return 0;
        }
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/moehoo.' + platform + '.node');
        if (!fs.existsSync(moehoo_path)) {
            logger.logError(`[NativePacketClient] Missing moehoo binary: ${moehoo_path}`);
            return 0;
        }
        return 10;
    }

    static create(core: NapCatCore): NativePacketClient {
        return new NativePacketClient(core);
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        const platform = process.platform + '.' + process.arch;
        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/moehoo.' + platform + '.node');
        process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);
        this.MoeHooExport.exports.InitHook(pid, recv, send, (type: number, uin: string, seq: number, cmd: string, hex_data: string) => {
            const callback = this.cb.get(createHash('md5').update(Buffer.from(hex_data, 'hex')).digest('hex') + (type === 0 ? 'send' : 'recv'));
            if (callback) {
                callback({ seq, cmd, hex_data });
            } else {
                this.logger.logError(`Callback not found for hex_data: ${hex_data}`);
            }
            // TODO: cannot use console.log here, fxxk tx
            //  Error [ERR_INSPECTOR_NOT_AVAILABLE]: Inspector is not available
            // console.log('type:', type, 'uin:', uin, 'seq:', seq, 'cmd:', cmd, 'hex_data:', hex_data);
        });
        this.isAvailable = true;
    }

    sendCommandImpl(cmd: string, data: string, trace_id: string): void {
        this.MoeHooExport.exports.SendPacket(cmd, data, crypto.createHash('md5').update(trace_id).digest('hex'));
    }

    connect(cb: () => void): Promise<void> {
        cb();
        return Promise.resolve();
    }
}
