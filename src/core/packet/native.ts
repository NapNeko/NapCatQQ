import { LogWrapper } from "@/common/log";
import { LRUCache } from "@/common/lru-cache";
import crypto, { createHash } from "crypto";
import { NapCatCore } from "@/core";
import { OidbPacket, PacketHexStr } from "@/core/packet/packer";
import path, { dirname } from "path";
import { fileURLToPath } from "url";
import fs from "fs";
import { constants } from "os";
import { console } from "inspector";

export interface RecvPacketData {
    seq: number;
    cmd: string;
    hex_data: string;
}

export class NativePacketClient {
    private isInit: boolean = false;
    private readonly cb = new LRUCache<string, (json: RecvPacketData) => Promise<void>>(500); // trace_id-type callback
    readonly napCatCore: NapCatCore;
    private readonly logger: LogWrapper;
    private supportedPlatforms = ['win32.x64'];
    private MoeHooExport: any = { exports: {} };

    constructor(core: NapCatCore) {
        this.napCatCore = core;
        this.logger = core.context.logger;
    }

    get available(): boolean {
        return this.isInit;
    }

    private randText(len: number): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    private async registerCallback(trace_id: string, type: string, callback: (json: RecvPacketData) => Promise<void>): Promise<void> {
        this.cb.put(createHash('md5').update(trace_id).digest('hex') + type, callback);
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        const platform = process.platform + '.' + process.arch;
        if (!this.supportedPlatforms.includes(platform)) {
            throw new Error(`Unsupported platform: ${platform}`);
        }

        const moehoo_path = path.join(dirname(fileURLToPath(import.meta.url)), './moehoo/moehoo.' + platform + '.node');
        if (!fs.existsSync(moehoo_path)) {
            throw new Error(`moehoo.${platform}.node not found`);
        }

        process.dlopen(this.MoeHooExport, moehoo_path, constants.dlopen.RTLD_LAZY);
        this.MoeHooExport.exports.InitHook(pid, recv, send, (type: number, uin: string, seq: number, cmd: string, hex_data: string) => {
            const callback = this.cb.get(createHash('md5').update(Buffer.from(hex_data, 'hex')).digest('hex') + (type === 0 ? 'send' : 'recv'));
            if (callback) {
                callback({ seq, cmd, hex_data });
            } else {
                this.logger.logError(`Callback not found for hex_data: ${hex_data}`);
            }
            console.log('type:', type, 'uin:', uin, 'seq:', seq, 'cmd:', cmd, 'hex_data:', hex_data);
        });
    }

    private async sendCommand(
        cmd: string,
        data: string,
        trace_id: string,
        rsp: boolean = false,
        timeout: number = 20000,
        sendcb: (json: RecvPacketData) => void = () => { }
    ): Promise<RecvPacketData> {
        return new Promise<RecvPacketData>((resolve, reject) => {
            if (!this.available) {
                throw new Error("MoeHoo is not Init");
            }

            this.MoeHooExport.exports.SendPacket(cmd, data, crypto.createHash('md5').update(trace_id).digest('hex'));

            if (rsp) {
                this.registerCallback(trace_id, 'recv', async (json: RecvPacketData) => {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                });
            }

            this.registerCallback(trace_id, 'send', async (json: RecvPacketData) => {
                sendcb(json);
                if (!rsp) {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                }
            });

            const timeoutHandle = setTimeout(() => {
                reject(new Error(`sendCommand timed out after ${timeout} ms for ${cmd} with trace_id ${trace_id}`));
            }, timeout);
        });
    }

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false): Promise<RecvPacketData> {
        return new Promise((resolve, reject) => {
            if (!this.available) {
                this.logger.logError('NapCat.Packet 未初始化！');
                return undefined;
            }

            const md5 = crypto.createHash('md5').update(data).digest('hex');
            const trace_id = (this.randText(4) + md5 + data).slice(0, data.length / 2);

            this.sendCommand(cmd, data, trace_id, rsp, 20000, async () => {
                await this.napCatCore.context.session.getMsgService().sendSsoCmdReqByContend(cmd, trace_id);
            }).then((res) => resolve(res)).catch((e: Error) => reject(e));
        });
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false): Promise<RecvPacketData> {
        return this.sendPacket(pkt.cmd, pkt.data, rsp);
    }
}