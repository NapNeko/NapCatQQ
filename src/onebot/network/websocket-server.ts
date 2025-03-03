import { OB11EmitEventContent, OB11NetworkReloadType } from './index';
import { Hono } from 'hono';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { Mutex } from 'async-mutex';
import { OB11Response } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { NapCatCore } from '@/core';
import { OB11HeartbeatEvent } from '@/onebot/event/meta/OB11HeartbeatEvent';
import { IncomingMessage } from 'http';
import { ActionMap } from '@/onebot/action';
import { LifeCycleSubType, OB11LifeCycleEvent } from '@/onebot/event/meta/OB11LifeCycleEvent';
import { WebsocketServerConfig } from '@/onebot/config/config';
import { NapCatOneBot11Adapter } from '@/onebot';
import { IOB11NetworkAdapter } from '@/onebot/network/adapter';
import { serve } from '@hono/node-server';
import json5 from 'json5';

export class OB11WebSocketServerAdapter extends IOB11NetworkAdapter<WebsocketServerConfig> {
    private app: Hono | undefined;
    private server: ReturnType<typeof serve> | undefined;
    wsServer?: WebSocketServer;
    wsClients: WebSocket[] = [];
    wsClientsMutex = new Mutex();
    private heartbeatIntervalId: NodeJS.Timeout | null = null;
    wsClientWithEvent: WebSocket[] = [];

    constructor(
        name: string, config: WebsocketServerConfig, core: NapCatCore, obContext: NapCatOneBot11Adapter, actions: ActionMap
    ) {
        super(name, config, core, obContext, actions);
    }

    private initializeServer() {
        this.app = new Hono();
        this.server = serve({
            fetch: this.app.fetch,
            port: this.config.port,
        });

        this.wsServer = new WebSocketServer({ noServer: true });
        this.server.on('upgrade', (request, socket, head) => {
            this.wsServer?.handleUpgrade(request, socket, head, (ws) => {
                this.wsServer?.emit('connection', ws, request);
            });
        });

        this.createServer(this.wsServer);
    }

    createServer(newServer: WebSocketServer) {
        newServer.on('connection', async (wsClient, wsReq) => {
            if (!this.isEnable) {
                wsClient.close();
                return;
            }
            //鉴权
            this.authorize(this.config.token, wsClient, wsReq);
            const paramUrl = wsReq.url?.indexOf('?') !== -1 ? wsReq.url?.substring(0, wsReq.url?.indexOf('?')) : wsReq.url;
            const isApiConnect = paramUrl === '/api' || paramUrl === '/api/';
            if (!isApiConnect) {
                this.connectEvent(this.core, wsClient);
            }

            wsClient.on('error', (err) => this.logger.log('[OneBot] [WebSocket Server] Client Error:', err.message));
            wsClient.on('message', (message) => {
                this.handleMessage(wsClient, message).then().catch(e => this.logger.logError(e));
            });
            wsClient.on('ping', () => {
                wsClient.pong();
            });
            wsClient.on('pong', () => {
                //this.logger.logDebug('[OneBot] [WebSocket Server] Pong received');
            });
            wsClient.once('close', () => {
                this.wsClientsMutex.runExclusive(async () => {
                    const NormolIndex = this.wsClients.indexOf(wsClient);
                    if (NormolIndex !== -1) {
                        this.wsClients.splice(NormolIndex, 1);
                    }
                    const EventIndex = this.wsClientWithEvent.indexOf(wsClient);
                    if (EventIndex !== -1) {
                        this.wsClientWithEvent.splice(EventIndex, 1);
                    }

                });
            });
            await this.wsClientsMutex.runExclusive(async () => {
                if (!isApiConnect) {
                    this.wsClientWithEvent.push(wsClient);
                }
                this.wsClients.push(wsClient);
            });
        }).on('error', (err) => this.logger.log('[OneBot] [WebSocket Server] Server Error:', err.message));
    }

    connectEvent(core: NapCatCore, wsClient: WebSocket) {
        try {
            this.checkStateAndReply<unknown>(new OB11LifeCycleEvent(core, LifeCycleSubType.CONNECT), wsClient);
        } catch (e) {
            this.logger.logError('[OneBot] [WebSocket Server] 发送生命周期失败', e);
        }
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        this.wsClientsMutex.runExclusive(async () => {
            this.wsClientWithEvent.forEach((wsClient) => {
                wsClient.send(JSON.stringify(event));
            });
        });
    }

    open() {
        if (this.isEnable) {
            this.logger.logError('[OneBot] [WebSocket Server] Cannot open a opened WebSocket server');
            return;
        }
        this.initializeServer();
        this.isEnable = true;
        if (this.config.heartInterval > 0) {
            this.registerHeartBeat();
        }
    }

    async close() {
        this.isEnable = false;
        this.server?.close();
        this.wsServer?.close((err) => {
            if (err) {
                this.logger.logError('[OneBot] [WebSocket Server] Error closing server:', err.message);
            } else {
                this.logger.log('[OneBot] [WebSocket Server] Server Closed');
            }
        });
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
        await this.wsClientsMutex.runExclusive(async () => {
            this.wsClients.forEach((wsClient) => {
                wsClient.close();
            });
            this.wsClients = [];
            this.wsClientWithEvent = [];
        });
    }

    private registerHeartBeat() {
        this.heartbeatIntervalId = setInterval(() => {
            this.wsClientsMutex.runExclusive(async () => {
                this.wsClientWithEvent.forEach((wsClient) => {
                    if (wsClient.readyState === WebSocket.OPEN) {
                        wsClient.send(JSON.stringify(new OB11HeartbeatEvent(this.core, this.config.heartInterval, this.core.selfInfo.online ?? true, true)));
                    }
                });
            });
        }, this.config.heartInterval);
    }

    private authorize(token: string | undefined, wsClient: WebSocket, wsReq: IncomingMessage) {
        if (!token || token.length == 0) return;//客户端未设置密钥
        const QueryClientToken = new URL(wsReq.url || '', `http://${wsReq.headers.host}`).searchParams.get('access_token');
        const HeaderClientToken = wsReq.headers.authorization?.split('Bearer ').pop() || '';
        const ClientToken = QueryClientToken || HeaderClientToken;
        if (ClientToken === token) {
            return;
        }
        wsClient.send(JSON.stringify(OB11Response.res(null, 'failed', 1403, 'token验证失败')));
        wsClient.close();
    }

    private checkStateAndReply<T>(data: T, wsClient: WebSocket) {
        if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify(data));
        }
    }

    private async handleMessage(wsClient: WebSocket, message: RawData) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        let receiveData: { action: typeof ActionName[keyof typeof ActionName], params?: any, echo?: any } = { action: ActionName.Unknown, params: {} };
        let echo = undefined;
        try {
            receiveData = json5.parse(message.toString());
            echo = receiveData.echo;
            //this.logger.logDebug('收到正向Websocket消息', receiveData);
        } catch {
            this.checkStateAndReply<unknown>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo), wsClient);
            return;
        }
        receiveData.params = (receiveData?.params) ? receiveData.params : {};//兼容类型验证 不然类型校验爆炸
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const action = this.actions.get(receiveData.action as any);
        if (!action) {
            this.logger.logError('[OneBot] [WebSocket Client] 发生错误', '不支持的API ' + receiveData.action);
            this.checkStateAndReply<unknown>(OB11Response.error('不支持的API ' + receiveData.action, 1404, echo), wsClient);
            return;
        }
        const retdata = await action.websocketHandle(receiveData.params, echo ?? '', this.name, this.config);
        this.checkStateAndReply<unknown>({ ...retdata }, wsClient);
    }

    async reload(newConfig: WebsocketServerConfig) {
        const wasEnabled = this.isEnable;
        const oldPort = this.config.port;
        const oldHost = this.config.host;
        const oldHeartbeatInterval = this.config.heartInterval;
        this.config = newConfig;

        if (newConfig.enable && !wasEnabled) {
            this.open();
            return OB11NetworkReloadType.NetWorkOpen;
        } else if (!newConfig.enable && wasEnabled) {
            this.close();
            return OB11NetworkReloadType.NetWorkClose;
        }

        if (oldPort !== newConfig.port || oldHost !== newConfig.host) {
            this.close();
            this.initializeServer();
            if (newConfig.enable) {
                this.open();
            }
            return OB11NetworkReloadType.NetWorkReload;
        }

        if (oldHeartbeatInterval !== newConfig.heartInterval) {
            if (this.heartbeatIntervalId) {
                clearInterval(this.heartbeatIntervalId);
                this.heartbeatIntervalId = null;
            }
            if (newConfig.heartInterval > 0 && this.isEnable) {
                this.registerHeartBeat();
            }
            return OB11NetworkReloadType.NetWorkReload;
        }

        return OB11NetworkReloadType.Normal;
    }
}