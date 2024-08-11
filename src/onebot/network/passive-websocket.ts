import { IOB11NetworkAdapter, OB11EmitEventContent } from './index';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
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

export class OB11PassiveWebSocketAdapter implements IOB11NetworkAdapter {
    wsServer: WebSocketServer;
    wsClients: WebSocket[] = [];
    wsClientsMutex = new Mutex();
    isOpen: boolean = false;
    hasBeenClosed: boolean = false;
    heartbeatInterval: number = 0;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();
    onebotContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;
    logger: LogWrapper;
    private heartbeatIntervalId: NodeJS.Timeout | null = null;

    authorize(token: string, wsClient: WebSocket, wsReq: any) {
        if (token && token.length > 0) {
            const url = wsClient.url!.split('?').shift();
            this.logger.log('ws connect', url);
            let clientToken: string = '';
            const authHeader = wsReq.headers['authorization'];
            if (authHeader) {
                clientToken = authHeader.split('Bearer ').pop() || '';
                this.logger.log('receive ws header token', clientToken);
            } else {
                const parsedUrl = urlParse.parse(wsClient.url || '/', true);
                const urlToken = parsedUrl.query.access_token;
                if (urlToken) {
                    if (Array.isArray(urlToken)) {
                        clientToken = urlToken[0];
                    } else {
                        clientToken = urlToken;
                    }
                    this.logger.log('receive ws url token', clientToken);
                }
            }
            if (clientToken != token) {
                wsClient.send(JSON.stringify(OB11Response.res(null, 'failed', 1403, 'token验证失败')));
                return wsClient.close();
            }
        }
    }

    constructor(ip: string, port: number, heartbeatInterval: number, token: string, coreContext: NapCatCore, onebotContext: NapCatOneBot11Adapter) {
        this.coreContext = coreContext;
        this.onebotContext = onebotContext;
        this.logger = coreContext.context.logger;

        this.heartbeatInterval = heartbeatInterval;
        this.wsServer = new WebSocketServer({ port: port, host: ip });
        this.wsServer.on('connection', async (wsClient, wsReq) => {
            if (!this.isOpen) {
                wsClient.close();
                return;
            }
            //鉴权
            this.authorize(token, wsClient, wsReq);

            wsClient.on('message', (message) => {
                this.handleMessage(wsClient, message);
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
        });
    }

    registerActionMap(actionMap: Map<string, BaseAction<any, any>>) {
        this.actionMap = actionMap;
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }

    registerHeartBeat() {
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

    onEvent<T extends OB11EmitEventContent>(event: T) {
        this.wsClientsMutex.runExclusive(async () => {
            this.wsClients.forEach((wsClient) => {
                const wrappedEvent = this.wrapEvent(event);
                wsClient.send(JSON.stringify(wrappedEvent));
            });
        });
    }

    open() {
        if (this.hasBeenClosed) {
            this.logger.logError('Cannot open a closed WebSocket server');
            return;
        }
        this.isOpen = true;
        this.registerHeartBeat();
    }

    async close() {
        this.isOpen = false;
        this.hasBeenClosed = true;
        this.wsServer.close();
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }

    async WsReplyAll<T>(data: T) {
        this.wsClientsMutex.runExclusive(async () => {
            this.wsClients.forEach((wsClient) => {
                if (wsClient.readyState === WebSocket.OPEN) {
                    wsClient.send(JSON.stringify(data));
                }
            });
        });
    }

    async WsReply<T>(data: T, wsClient: WebSocket) {
        if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(JSON.stringify(data));
        }
    }

    private handleMessage(wsClient: WebSocket, message: any) {
        let receiveData: { action: ActionName, params?: any, echo?: any } = { action: ActionName.Unknown, params: {} };
        let echo = null;
        try {
            try {
                receiveData = JSON.parse(message.toString());
                echo = receiveData.echo;
                this.logger.logDebug('收到正向Websocket消息', receiveData);
            } catch (e) {
                this.WsReply<any>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo), wsClient);
            }
            receiveData.params = (receiveData?.params) ? receiveData.params : {};//兼容类型验证
        } catch (e) {
            this.WsReply<any>(OB11Response.error('不支持的api ' + receiveData.action, 1404, echo), wsClient);
        }
    }

    private wrapEvent<T extends OB11EmitEventContent>(event: T) {
        return {
            type: 'event',
            data: event
        };
    }
}

