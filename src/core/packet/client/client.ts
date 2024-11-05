import { LRUCache } from "@/common/lru-cache";
import { NapCatCore } from "@/core";
import { LogWrapper } from "@/common/log";
import crypto, { createHash } from "crypto";
import { OidbPacket, PacketHexStr } from "@/core/packet/packer";
import { NapCatConfig } from "@/core/helper/config";

export interface RecvPacket {
    type: string, // 仅recv
    trace_id_md5?: string,
    data: RecvPacketData
}

export interface RecvPacketData {
    seq: number
    cmd: string
    hex_data: string
}

export abstract class PacketClient {
    readonly napCatCore: NapCatCore;
    protected readonly logger: LogWrapper;
    protected readonly cb = new LRUCache<string, (json: RecvPacketData) => Promise<void>>(500); // trace_id-type callback
    protected isAvailable: boolean = false;
    protected config: NapCatConfig;

    protected constructor(core: NapCatCore) {
        this.napCatCore = core;
        this.logger = core.context.logger;
        this.config = core.configLoader.configData;
    }

    private randText(len: number): string {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    get available(): boolean {
        return this.isAvailable;
    }

    abstract check(core: NapCatCore): boolean;

    abstract init(pid: number, recv: string, send: string): Promise<void>;

    abstract connect(cb: () => void): Promise<void>;

    abstract sendCommandImpl(cmd: string, data: string, trace_id: string): void;

    private async registerCallback(trace_id: string, type: string, callback: (json: RecvPacketData) => Promise<void>): Promise<void> {
        this.cb.put(createHash('md5').update(trace_id).digest('hex') + type, callback);
    }

    private async sendCommand(cmd: string, data: string, trace_id: string, rsp: boolean = false, timeout: number = 20000, sendcb: (json: RecvPacketData) => void = () => {
    }): Promise<RecvPacketData> {
        return new Promise<RecvPacketData>((resolve, reject) => {
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
            this.sendCommandImpl(cmd, data, trace_id);
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
                //console.log('sendPacket:', cmd, data, trace_id);
                await this.napCatCore.context.session.getMsgService().sendSsoCmdReqByContend(cmd, trace_id);
            }).then((res) => resolve(res)).catch((e: Error) => reject(e));
        });
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false): Promise<RecvPacketData> {
        return this.sendPacket(pkt.cmd, pkt.data, rsp);
    }
}
