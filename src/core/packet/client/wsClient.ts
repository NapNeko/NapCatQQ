import { Data, WebSocket } from "ws";
import { IPacketClient, RecvPacket } from "@/core/packet/client/baseClient";
import { PacketContext } from "@/core/packet/context/packetContext";

export class wsPacketClient extends IPacketClient {
    private websocket: WebSocket | null = null;
    private reconnectAttempts: number = 0;
    private readonly maxReconnectAttempts: number = 60; // 现在暂时不可配置
    private readonly clientUrl: string;
    private readonly clientUrlWrap: (url: string) => string = (url: string) => `ws://${url}/ws`;

    private isInitialized: boolean = false;
    private initPayload: { pid: number, recv: string, send: string } | null = null;

    constructor(context: PacketContext) {
        super(context);
        this.clientUrl = this.context.napcore.config.packetServer
            ? this.clientUrlWrap(this.context.napcore.config.packetServer)
            : this.clientUrlWrap('127.0.0.1:8083');
    }

    check(): boolean {
        if (!this.context.napcore.config.packetServer) {
            this.context.logger.warn(`wsPacketClient 未配置服务器地址`);
            return false;
        }
        return true;
    }

    async init(pid: number, recv: string, send: string): Promise<void> {
        this.initPayload = { pid, recv, send };
        await this.connectWithRetry();
    }

    sendCommandImpl(cmd: string, data: string, trace_id: string): void {
        if (this.websocket && this.websocket.readyState === WebSocket.OPEN) {
            this.websocket.send(JSON.stringify({
                action: 'send',
                cmd,
                data,
                trace_id
            }));
        } else {
            this.context.logger.warn(`WebSocket 未连接，无法发送命令: ${cmd}`);
        }
    }

    private async connectWithRetry(): Promise<void> {
        while (this.reconnectAttempts < this.maxReconnectAttempts) {
            try {
                await this.connect();
                return;
            } catch (error) {
                this.reconnectAttempts++;
                this.context.logger.warn(`第 ${this.reconnectAttempts}/${this.maxReconnectAttempts} 次尝试重连失败！`);
                await this.delay(5000);
            }
        }
        this.context.logger.error(`wsPacketClient 在 ${this.clientUrl} 达到最大重连次数 (${this.maxReconnectAttempts})！`);
        throw new Error(`无法连接到 WebSocket 服务器：${this.clientUrl}`);
    }

    private connect(): Promise<void> {
        return new Promise((resolve, reject) => {
            this.websocket = new WebSocket(this.clientUrl);
            this.websocket.onopen = () => {
                this.available = true;
                this.reconnectAttempts = 0;
                this.context.logger.info(`wsPacketClient 已连接到 ${this.clientUrl}`);
                if (!this.isInitialized && this.initPayload) {
                    this.websocket!.send(JSON.stringify({
                        action: 'init',
                        ...this.initPayload
                    }));
                    this.isInitialized = true;
                }
                resolve();
            };
            this.websocket.onclose = () => {
                this.available = false;
                this.context.logger.warn(`WebSocket 连接关闭，尝试重连...`);
                reject(new Error('WebSocket 连接关闭'));
            };
            this.websocket.onmessage = (event) => this.handleMessage(event.data).catch(err => {
                this.context.logger.error(`处理消息时出错: ${err}`);
            });
            this.websocket.onerror = (error) => {
                this.available = false;
                this.context.logger.error(`WebSocket 出错: ${error.message}`);
                this.websocket?.close();
                reject(error);
            };
        });
    }

    private delay(ms: number): Promise<void> {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    private async handleMessage(message: Data): Promise<void> {
        try {
            const json: RecvPacket = JSON.parse(message.toString());
            const trace_id_md5 = json.trace_id_md5;
            const action = json?.type ?? 'init';
            const event = this.cb.get(`${trace_id_md5}${action}`);
            if (event) await event(json.data);
        } catch (error) {
            this.context.logger.error(`解析ws消息时出错: ${(error as Error).message}`);
        }
    }
}
