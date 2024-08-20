import { IOB11NetworkAdapter, OB11EmitEventContent } from './index';
import urlParse from 'url';
import BaseAction from '@/onebot/action/BaseAction';
import { WebSocket, WebSocketServer } from 'ws';
import { Mutex } from 'async-mutex';
import { OB11Response } from '../action/OB11Response';
import { ActionName } from '../action/types';
import { NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '..';
import { LogWrapper } from '@/common/utils/log';
import { OB11HeartbeatEvent } from '../event/meta/OB11HeartbeatEvent';
import { IncomingMessage } from 'http';
import { ActionMap } from '@/onebot/action';
import { LifeCycleSubType, OB11LifeCycleEvent } from '../event/meta/OB11LifeCycleEvent';

export class OB11PassiveWebSocketAdapter implements IOB11NetworkAdapter {
    wsServer: WebSocketServer;
    wsClients: WebSocket[] = [];
    wsClientsMutex = new Mutex();
    isOpen: boolean = false;
    hasBeenClosed: boolean = false;
    heartbeatInterval: number = 0;
    coreContext: NapCatCore;
    logger: LogWrapper;
    private heartbeatIntervalId: NodeJS.Timeout | null = null;

    constructor(
        ip: string,
        port: number,
        heartbeatInterval: number,
        token: string,
        coreContext: NapCatCore,
        public actions: ActionMap
    ) {
        this.coreContext = coreContext;
        this.logger = coreContext.context.logger;

        this.heartbeatInterval = heartbeatInterval;
        this.wsServer = new WebSocketServer({ port: port, host: ip, maxPayload: 1024 * 1024 * 1024, });
        const core = coreContext;
        this.wsServer.on('connection', async (wsClient, wsReq) => {
            if (!this.isOpen) {
                wsClient.close();
                return;
            }
            //鉴权
            this.authorize(token, wsClient, wsReq);
            this.connectEvent(core, wsClient);
            wsClient.on('error', (err) => this.logger.log('[OneBot] [WebSocket Server] Client Error:', err.message));
            wsClient.on('message', (message) => {
                this.handleMessage(wsClient, message).then().catch(this.logger.logError);
            });
            wsClient.on('ping', () => {
                wsClient.pong();
            });
            wsClient.on('pong', () => {
                //this.logger.logDebug('[OneBot] [WebSocket Server] Pong received');
            });
            wsClient.once('close', () => {
                this.wsClientsMutex.runExclusive(async () => {
                    const index = this.wsClients.indexOf(wsClient);
                    if (index !== -1) {
                        this.wsClients.splice(index, 1);
                    }
                });
            });
            await this.wsClientsMutex.runExclusive(async () => {
                this.wsClients.push(wsClient);
            });
        }).on('error', (err) => this.logger.log('[OneBot] [WebSocket Server] Server Error:', err.message));
    }

    connectEvent(core: NapCatCore, wsClient: WebSocket) {
        try {
            this.checkStateAndReply<any>(new OB11LifeCycleEvent(core, LifeCycleSubType.CONNECT), wsClient);
        } catch (e) {
            this.logger.logError('[OneBot] [WebSocket Server] 发送生命周期失败', e);
        }
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        this.wsClientsMutex.runExclusive(async () => {
            this.wsClients.forEach((wsClient) => {
                wsClient.send(JSON.stringify(event));
            });
        });
    }

    open() {
        if (this.isOpen) {
            this.logger.logError('[OneBot] [WebSocket Server] Cannot open a opened WebSocket server');
            return;
        }
        if (this.hasBeenClosed) {
            this.logger.logError('[OneBot] [WebSocket Server] Cannot open a WebSocket server that has been closed');
            return;
        }
        const addressInfo = this.wsServer.address();
        this.logger.log('[OneBot] [WebSocket Server] Server Started', typeof (addressInfo) === 'string' ? addressInfo : addressInfo?.address + ':' + addressInfo?.port);

        this.isOpen = true;
        this.registerHeartBeat();
    }

    async close() {
        this.isOpen = false;
        this.wsServer.close();
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }

    private registerHeartBeat() {
        this.heartbeatIntervalId = setInterval(() => {
            this.wsClientsMutex.runExclusive(async () => {
                this.wsClients.forEach((wsClient) => {
                    if (wsClient.readyState === WebSocket.OPEN) {
                        wsClient.send(JSON.stringify(new OB11HeartbeatEvent(this.coreContext, this.heartbeatInterval, this.coreContext.selfInfo.online, true)));
                    }
                });
            });
        }, this.heartbeatInterval);
    }

    private authorize(token: string | undefined, wsClient: WebSocket, wsReq: IncomingMessage) {
        if (!token || token.length == 0) return;//客户端未设置密钥
        const QueryClientToken = urlParse.parse(wsReq?.url || '', true).query.access_token;
        const HeaderClientToken = wsReq.headers.authorization?.split('Bearer ').pop() || '';
        const ClientToken = typeof (QueryClientToken) === 'string' && QueryClientToken !== '' ? QueryClientToken : HeaderClientToken;
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

    private async handleMessage(wsClient: WebSocket, message: any) {
        let receiveData: { action: ActionName, params?: any, echo?: any } = { action: ActionName.Unknown, params: {} };
        let echo = undefined;
        try {
            try {
                receiveData = JSON.parse(message.toString());
                echo = receiveData.echo;
                //this.logger.logDebug('收到正向Websocket消息', receiveData);
            } catch (e) {
                this.checkStateAndReply<any>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo), wsClient);
                return;
            }
            receiveData.params = (receiveData?.params) ? receiveData.params : {};//兼容类型验证
            const retdata = await this.actions.get(receiveData.action)?.websocketHandle(receiveData.params, echo || '');
            const packet = Object.assign({}, retdata);
            this.checkStateAndReply<any>(packet, wsClient);
        } catch (e) {
            this.checkStateAndReply<any>(OB11Response.error('不支持的api ' + receiveData.action, 1404, echo), wsClient);
        }
    }

}

