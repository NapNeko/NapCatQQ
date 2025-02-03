import { LRUCache } from '@/common/lru-cache';
import crypto, { createHash } from 'crypto';
import { OidbPacket, PacketHexStr } from '@/core/packet/transformer/base';
import { LogStack } from '@/core/packet/context/clientContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';

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

function randText(len: number): string {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < len; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}


export abstract class IPacketClient {
    protected readonly napcore: NapCoreContext;
    protected readonly logger: PacketLogger;
    protected readonly cb = new LRUCache<string, (json: RecvPacketData) => Promise<void>>(500); // trace_id-type callback
    logStack: LogStack;
    available: boolean = false;

    protected constructor(napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) {
        this.napcore = napCore;
        this.logger = logger;
        this.logStack = logStack;
    }

    abstract check(): boolean;

    abstract init(pid: number, recv: string, send: string): Promise<void>;

    abstract sendCommandImpl(cmd: string, data: string, trace_id: string): void;

    private async registerCallback(trace_id: string, type: string, callback: (json: RecvPacketData) => Promise<void>): Promise<void> {
        this.cb.put(createHash('md5').update(trace_id).digest('hex') + type, callback);
    }

    private async sendCommand(cmd: string, data: string, trace_id: string, rsp: boolean = false, timeout: number = 20000, sendcb: (json: RecvPacketData) => void = () => {
    }): Promise<RecvPacketData> {
        return new Promise<RecvPacketData>((resolve, reject) => {
            if (!this.available) {
                reject(new Error('packetBackend 当前不可用！'));
            }

            const timeoutHandle = setTimeout(() => {
                reject(new Error(`sendCommand timed out after ${timeout} ms for ${cmd} with trace_id ${trace_id}`));
            }, timeout);

            this.registerCallback(trace_id, 'send', async (json: RecvPacketData) => {
                sendcb(json);
                if (!rsp) {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                }
            });

            if (rsp) {
                this.registerCallback(trace_id, 'recv', async (json: RecvPacketData) => {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                });
            }

            this.sendCommandImpl(cmd, data, trace_id);
        });
    }

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false): Promise<RecvPacketData> {
        const md5 = crypto.createHash('md5').update(data).digest('hex');
        const trace_id = (randText(4) + md5 + data).slice(0, data.length / 2);
        return this.sendCommand(cmd, data, trace_id, rsp, 20000, async () => {
            await this.napcore.sendSsoCmdReqByContend(cmd, trace_id);
        });
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false): Promise<RecvPacketData> {
        return this.sendPacket(pkt.cmd, pkt.data, rsp);
    }
}
