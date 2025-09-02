import crypto, { createHash } from 'crypto';
import { OidbPacket, PacketHexStr } from '@/core/packet/transformer/base';
import { LogStack } from '@/core/packet/context/clientContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';

export interface RecvPacket {
    type: string, // 仅recv
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
    protected readonly cb = new Map<string, (json: RecvPacketData) => Promise<any> | any>(); // hash-type callback
    logStack: LogStack;
    available: boolean = false;

    protected constructor(napCore: NapCoreContext, logger: PacketLogger, logStack: LogStack) {
        this.napcore = napCore;
        this.logger = logger;
        this.logStack = logStack;
    }

    abstract check(): boolean;

    abstract init(pid: number, recv: string, send: string): Promise<void>;

    abstract sendCommandImpl(cmd: string, data: string, hash: string, timeout: number): void;

    private async sendCommand(cmd: string, data: string, trace_data: string, rsp: boolean = false, timeout: number = 20000, sendcb: (json: RecvPacketData) => void = () => {
    }): Promise<RecvPacketData> {
        return new Promise<RecvPacketData>((resolve, reject) => {
            if (!this.available) {
                reject(new Error('packetBackend 当前不可用！'));
            }
            let hash = createHash('md5').update(trace_data).digest('hex');
            const timeoutHandle = setTimeout(() => {
                this.cb.delete(hash + 'send');
                this.cb.delete(hash + 'recv');
                reject(new Error(`sendCommand timed out after ${timeout} ms for ${cmd} with hash ${hash}`));
            }, timeout);
            this.cb.set(hash + 'send', async (json: RecvPacketData) => {
                sendcb(json);
                if (!rsp) {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                }
            });

            if (rsp) {
                this.cb.set(hash + 'recv', async (json: RecvPacketData) => {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                });
            }
            this.sendCommandImpl(cmd, data, hash, timeout);
        });
    }

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false, timeout = 20000): Promise<RecvPacketData> {
        const md5 = crypto.createHash('md5').update(data).digest('hex');
        const trace_data = (randText(4) + md5 + data).slice(0, data.length / 2);// trace_data
        return this.sendCommand(cmd, data, trace_data, rsp, timeout, async () => {
            await this.napcore.sendSsoCmdReqByContend(cmd, trace_data);
        });
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false, timeout = 20000): Promise<RecvPacketData> {
        return this.sendPacket(pkt.cmd, pkt.data, rsp, timeout);
    }
}
