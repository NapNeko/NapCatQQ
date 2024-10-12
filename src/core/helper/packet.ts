import { LogWrapper } from "@/common/log";
import { LRUCache } from "@/common/lru-cache";
import WebSocket from "ws";
import { createHash } from "crypto";

export class PacketClient {
    private websocket: WebSocket | undefined;
    public isConnected: boolean = false;
    private reconnectAttempts: number = 0;
    private maxReconnectAttempts: number = 5;
    //trace_id-type callback
    private cb = new LRUCache<string, any>(500);
    constructor(private url: string, public logger: LogWrapper) { }

    connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.logger.log.bind(this.logger)(`Attempting to connect to ${this.url}`);
            this.websocket = new WebSocket(this.url);
            this.websocket.on('error', (err) => this.logger.logError.bind(this.logger)('[Core] [Packet Server] Error:', err.message));
            
            this.websocket.onopen = () => {
                this.isConnected = true;
                this.reconnectAttempts = 0;
                this.logger.log.bind(this.logger)(`Connected to ${this.url}`);
                resolve();
            };

            this.websocket.onerror = (error) => {
                this.logger.logError.bind(this.logger)(`WebSocket error: ${error}`);
                reject(error);
            };

            this.websocket.onmessage = (event) => {
                // const message = JSON.parse(event.data.toString());
                // console.log("Received message:", message);
                this.handleMessage(event.data);
            };

            this.websocket.onclose = () => {
                this.isConnected = false;
                this.logger.logWarn.bind(this.logger)(`Disconnected from ${this.url}`);
                this.attemptReconnect();
            };
        });
    }

    private attemptReconnect(): void {
        try {
            if (this.reconnectAttempts < this.maxReconnectAttempts) {
                this.reconnectAttempts++;
                this.logger.logError.bind(this.logger)(`Reconnecting attempt ${this.reconnectAttempts}`);
                setTimeout(() => this.connect().then().catch(), 1000 * this.reconnectAttempts);
            } else {
                this.logger.logError.bind(this.logger)(`Max reconnect attempts reached. Could not reconnect to ${this.url}`);
            }
        } catch (error) {
            this.logger.logError.bind(this.logger)(`Error attempting to reconnect: ${error}`);
        }
    }
    async registerCallback(trace_id: string, type: string, callback: any): Promise<void> {
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

    async sendCommand(cmd: string, data: string, trace_id: string, rsp: boolean = false, timeout: number = 5000, sendcb: any = () => { }): Promise<any> {
        return new Promise<any>((resolve, reject) => {
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
                this.registerCallback(trace_id, 'recv', (json: any) => {
                    clearTimeout(timeoutHandle);
                    resolve(json);
                });
            }
            this.registerCallback(trace_id, 'send', (json: any) => {
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
    private async handleMessage(message: any): Promise<void> {
        try {

            let json = JSON.parse(message.toString());
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