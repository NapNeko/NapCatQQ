import { OidbPacket, PacketHexStr } from '@/core/packet/transformer/base';
import { LogStack } from '@/core/packet/context/clientContext';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketLogger } from '@/core/packet/context/loggerContext';
import { CancelableTask } from '@/common/cancel-task';

export interface RecvPacket {
    type: string, // 仅recv
    data: RecvPacketData
}

export interface RecvPacketData {
    seq: number
    cmd: string
    data: Buffer
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

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false, timeout = 5000): Promise<RecvPacketData> {
        if (!rsp) {
            this.napcore.sendSsoCmdReqByContend(cmd, Buffer.from(data, 'hex')).catch(err => {
                this.logger.error(`[PacketClient] sendPacket 无响应命令发送失败 cmd=${cmd} err=${err}`);
            });
            return { seq: 0, cmd: cmd, data: Buffer.alloc(0) };
        }

        const task = new CancelableTask<RecvPacketData>((resolve, reject, onCancel) => {
            const timeoutId = setTimeout(() => {
                reject(new Error(`[PacketClient] sendPacket 超时 cmd=${cmd} timeout=${timeout}ms`));
            }, timeout);

            onCancel(() => {
                clearTimeout(timeoutId);
            });

            this.napcore.sendSsoCmdReqByContend(cmd, Buffer.from(data, 'hex'))
                .then(ret => {
                    clearTimeout(timeoutId);
                    const result = ret as { rspbuffer: Buffer };
                    resolve({
                        seq: 0,
                        cmd: cmd,
                        data: result.rspbuffer
                    });
                })
                .catch(err => {
                    clearTimeout(timeoutId);
                    reject(err);
                });
        });

        return await task;
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false, timeout = 5000): Promise<RecvPacketData> {
        return await this.sendPacket(pkt.cmd, pkt.data, rsp, timeout);
    }
}
