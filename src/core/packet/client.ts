import {LogWrapper} from "@/common/log";
import {LRUCache} from "@/common/lru-cache";
import WebSocket, {Data} from "ws";
import {createHash} from "crypto";

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
    private maxReconnectAttempts: number = 5;
    private cb = new LRUCache<string, (json: RecvPacketData) => Promise<void>>(500); // trace_id-type callback
    private readonly clientUrl: string = '';
    private readonly logger: LogWrapper;

    constructor(url: string, logger: LogWrapper) {
        this.clientUrl = url;
        this.logger = logger;
    }

    get available(): boolean {
        return this.isConnected && this.websocket !== undefined;
    }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.log.bind(this.logger)(`Attempting to connect to ${this.clientUrl}`);
            this.websocket = new WebSocket(this.clientUrl);
            this.websocket.on('error', (err) => this.logger.logError.bind(this.logger)('[Core] [Packet Server] Error:', err.message));

            this.websocket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.logger.log.bind(this.logger)(`Connected to ${this.clientUrl}`);
                resolve();
            };

            this.websocket.onerror = (error) => {
                this.logger.logError.bind(this.logger)(`WebSocket error: ${error}`);
                reject(error);
            };

            this.websocket.onmessage = (event) => {
                // const message = JSON.parse(event.data.toString());
                // console.log("Received message:", message);
                this.handleMessage(event.data).then().catch();
            };

            this.websocket.onclose = () => {
                this.isConnected = false;
                this.logger.logWarn.bind(this.logger)(`Disconnected from ${this.clientUrl}`);
                this.attemptReconnect();
            };
        });
    }

    private attemptReconnect(): void {
        try {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                this.logger.logError.bind(this.logger)(`Reconnecting attempt ${this.reconnectAttempts}`);
                setTimeout(() => {
                    this.connect().catch((error) => {
                        this.logger.logError.bind(this.logger)(`Reconnect attempt failed: ${error.message}`);
                    });
                }, 5000 * this.reconnectAttempts);
            } else {
                this.logger.logError.bind(this.logger)(`Max reconnect attempts reached. Could not reconnect to ${this.clientUrl}`);
            }
        } catch (error: any) {
            this.logger.logError.bind(this.logger)(`Error attempting to reconnect: ${error.message}`);
        }
    }

    async registerCallback(trace_id: string, type: string, callback: (json: RecvPacketData) => Promise<void>): Promise<void> {
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

    async sendCommand(cmd: string, data: string, trace_id: string, rsp: boolean = false, timeout: number = 5000, sendcb: (json: RecvPacketData) => void = () => {
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
                reject(new Error(`sendCommand timed out after ${timeout} ms`));
            }, timeout);
        });
    }

    private async handleMessage(message: Data): Promise<void> {
        try {
            let json: RecvPacket = JSON.parse(message.toString());
            let trace_id_md5 = json.trace_id_md5;
            let action = json?.type ?? 'init';
            let event = this.cb.get(trace_id_md5 + action);
            if (event) {
                await event(json.data);
            }
            //console.log("Received message:", json);
        } catch (error) {
            this.logger.logError.bind(this.logger)(`Error parsing message: ${error}`);
        }
    }
}
