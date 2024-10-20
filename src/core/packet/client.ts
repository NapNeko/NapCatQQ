import { LogWrapper } from "@/common/log";
import { LRUCache } from "@/common/lru-cache";
import WebSocket, { Data } from "ws";
import crypto, { createHash } from "crypto";
import { NapCatCore } from "@/core";
import { PacketHexStr } from "@/core/packet/packer";
import { sleep } from "@/common/helper";

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

export class PacketClient {
    private websocket: WebSocket | undefined;
    private isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 60;//现在暂时不可配置
    private readonly cb = new LRUCache<string, (json: RecvPacketData) => Promise<void>>(500); // trace_id-type callback
    private readonly clientUrl: string = '';
    readonly napCatCore: NapCatCore;
    private readonly logger: LogWrapper;

    constructor(url: string, core: NapCatCore) {
        this.clientUrl = url;
        this.napCatCore = core;
        this.logger = core.context.logger;
    }

    get available(): boolean {
        return this.isConnected && this.websocket !== undefined;
    }

    private randText(len: number) {
        let text = '';
        const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        for (let i = 0; i < len; i++) {
            text += possible.charAt(Math.floor(Math.random() * possible.length));
        }
        return text;
    }

    connect(cb: any): Promise<void> {
        return new Promise((resolve, reject) => {
            //this.logger.log.bind(this.logger)(`[Core] [Packet Server] Attempting to connect to ${this.clientUrl}`);
            this.websocket = new WebSocket(this.clientUrl);
            this.websocket.on('error', (err) => { }/*this.logger.logError.bind(this.logger)('[Core] [Packet Server] Error:', err.message)*/);

            this.websocket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.logger.log.bind(this.logger)(`[Core] [Packet Server] Connected to ${this.clientUrl}`);
                cb();
                resolve();
            };

            this.websocket.onerror = (error) => {
                //this.logger.logError.bind(this.logger)(`WebSocket error: ${error}`);
                reject(new Error(`${error.message}`));
            };

            this.websocket.onmessage = (event) => {
                // const message = JSON.parse(event.data.toString());
                // console.log("Received message:", message);
                this.handleMessage(event.data).then().catch();
            };

            this.websocket.onclose = () => {
                this.isConnected = false;
                //this.logger.logWarn.bind(this.logger)(`[Core] [Packet Server] Disconnected from ${this.clientUrl}`);
                this.attemptReconnect(cb);
            };
        });
    }

    private attemptReconnect(cb: any): void {
        try {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                setTimeout(() => {
                    this.connect(cb).catch((error) => {
                        this.logger.logError.bind(this.logger)(`[Core] [Packet Server] Reconnecting attempt failed,${error.message}`);
                    });
                }, 5000 * this.reconnectAttempts);
            } else {
                this.logger.logError.bind(this.logger)(`[Core] [Packet Server] Max reconnect attempts reached. ${this.clientUrl}`);
            }
        } catch (error: any) {
            this.logger.logError.bind(this.logger)(`Error attempting to reconnect: ${error.message}`);
        }
    }

    private async registerCallback(trace_id: string, type: string, callback: (json: RecvPacketData) => Promise<void>): Promise<void> {
        this.cb.put(createHash('md5').update(trace_id).digest('hex') + type, callback);
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        if (!this.isConnected || !this.websocket) {
            throw new Error("WebSocket is not connected");
        }
        const initMessage = {
            action: 'init',
            pid: pid,
            recv: recv,
            send: send
        };
        this.websocket.send(JSON.stringify(initMessage));
    }

    private async sendCommand(cmd: string, data: string, trace_id: string, rsp: boolean = false, timeout: number = 20000, sendcb: (json: RecvPacketData) => void = () => {
    }): Promise<RecvPacketData> {
        return new Promise<RecvPacketData>((resolve, reject) => {
            if (!this.isConnected || !this.websocket) {
                throw new Error("WebSocket is not connected");
            }
            const commandMessage = {
                action: 'send',
                cmd: cmd,
                data: data,
                trace_id: trace_id
            };
            this.websocket.send(JSON.stringify(commandMessage));
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

    private async handleMessage(message: Data): Promise<void> {
        try {
            const json: RecvPacket = JSON.parse(message.toString());
            const trace_id_md5 = json.trace_id_md5;
            const action = json?.type ?? 'init';
            const event = this.cb.get(trace_id_md5 + action);
            if (event) {
                await event(json.data);
            }
            //console.log("Received message:", json);
        } catch (error) {
            this.logger.logError.bind(this.logger)(`Error parsing message: ${error}`);
        }
    }

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false): Promise<RecvPacketData> {
        // wtfk tx
        // 校验失败和异常 可能返回undefined
        return new Promise((resolve, reject) => {
            if (!this.available) {
                this.logger.logError('NapCat.Packet is not init');
                return undefined;
            }
            const md5 = crypto.createHash('md5').update(data).digest('hex');
            const trace_id = (this.randText(4) + md5 + data).slice(0, data.length / 2);
            this.sendCommand(cmd, data, trace_id, rsp, 20000, async () => {
                // await sleep(10);
                await this.napCatCore.context.session.getMsgService().sendSsoCmdReqByContend(cmd, trace_id);
            }).then((res) => resolve(res)).catch((e: Error) => reject(e));
        });
    }
}
