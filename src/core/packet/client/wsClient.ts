import { Data, WebSocket } from "ws";
import { NapCatCore } from "@/core";
import { PacketClient, RecvPacket } from "@/core/packet/client/client";

export class wsPacketClient extends PacketClient {
    private websocket: WebSocket | undefined;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 60; // 现在暂时不可配置
    private readonly clientUrl: string | null = null;
    private clientUrlWrap: (url: string) => string = (url: string) => `ws://${url}/ws`;

    constructor(core: NapCatCore) {
        super(core);
        this.clientUrl = this.config.packetServer ? this.clientUrlWrap( this.config.packetServer) : null;
    }

    check(): boolean {
        if (!this.clientUrl) {
            this.logger.logWarn(`[Core] [Packet:Server] 未配置服务器地址`);
            return false;
        }
        return true;
    }

    connect(cb: () => void): Promise<void> {
        return new Promise((resolve, reject) => {
            //this.logger.log.bind(this.logger)(`[Core] [Packet Server] Attempting to connect to ${this.clientUrl}`);
            this.websocket = new WebSocket(this.clientUrl!);
            this.websocket.on('error', (err) => { }/*this.logger.logError.bind(this.logger)('[Core] [Packet Server] Error:', err.message)*/);

            this.websocket.onopen = () => {
                this.isAvailable = true;
                this.reconnectAttempts = 0;
                this.logger.log.bind(this.logger)(`[Core] [Packet:Server] 已连接到 ${this.clientUrl}`);
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
                this.isAvailable = false;
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
                        this.logger.logError.bind(this.logger)(`[Core] [Packet:Server] 尝试重连失败：${error.message}`);
                    });
                }, 5000 * this.reconnectAttempts);
            } else {
                this.logger.logError.bind(this.logger)(`[Core] [Packet:Server] ${this.clientUrl} 已达到最大重连次数！`);
            }
        } catch (error: any) {
            this.logger.logError.bind(this.logger)(`[Core] [Packet:Server] 重连时出错: ${error.message}`);
        }
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        if (!this.isAvailable || !this.websocket) {
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

    sendCommandImpl(cmd: string, data: string, trace_id: string) : void {
        const commandMessage = {
            action: 'send',
            cmd: cmd,
            data: data,
            trace_id: trace_id
        };
        this.websocket!.send(JSON.stringify(commandMessage));
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
}
