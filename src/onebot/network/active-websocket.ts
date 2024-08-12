import { IOB11NetworkAdapter, OB11EmitEventContent } from '@/onebot/network/index';
import { WebSocket } from 'ws';
import BaseAction from '@/onebot/action/BaseAction';
import { OB11HeartbeatEvent } from '../event/meta/OB11HeartbeatEvent';
import { NapCatCore } from '@/core';
import { ActionName } from '@/onebot/action/types';
import { OB11Response } from '@/onebot/action/OB11Response';
import { LogWrapper } from '@/common/utils/log';
import { NapCatOneBot11Adapter } from '@/onebot';

export class OB11ActiveWebSocketAdapter implements IOB11NetworkAdapter {
    url: string;
    reconnectIntervalInMillis: number;
    isClosed: boolean = false;
    heartbeatInterval: number;
    obContext: NapCatOneBot11Adapter;
    coreContext: NapCatCore;
    logger: LogWrapper;
    private connection: WebSocket | null = null;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();
    private heartbeatRef: NodeJS.Timeout | null = null;
    private readonly token: string;
    
    constructor(url: string, reconnectIntervalInMillis: number, heartbeatInterval: number, token:string, coreContext: NapCatCore, onebotContext: NapCatOneBot11Adapter) {
        this.url = url;
        this.token = token;
        this.heartbeatInterval = heartbeatInterval;
        this.reconnectIntervalInMillis = reconnectIntervalInMillis;
        this.coreContext = coreContext;
        this.obContext = onebotContext;
        this.logger = coreContext.context.logger;
    }

    registerActionMap(actionMap: Map<string, BaseAction<any, any>>) {
        this.actionMap = actionMap;
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        if (this.connection) {
            this.connection.send(JSON.stringify(event));
        }
    }

    async open() {
        if (this.connection) {
            return;
        }
        this.heartbeatRef = setInterval(() => {
            if (this.connection && this.connection.readyState === WebSocket.OPEN) {
                this.connection.send(JSON.stringify(new OB11HeartbeatEvent(this.coreContext, this.heartbeatInterval, this.coreContext.selfInfo.online, true)));
            }
        }, this.heartbeatInterval);
        await this.tryConnect();
    }

    close() {
        if (this.isClosed) {
            this.logger.logDebug('Cannot close a closed WebSocket connection');
            return;
            //throw new Error('Cannot close a closed WebSocket connection');
        }
        this.isClosed = true;
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
        if (this.heartbeatRef) {
            clearInterval(this.heartbeatRef);
            this.heartbeatRef = null;
        }
    }

    private checkStateAndReply<T>(data: T) {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(data));
        }
    }

    private async tryConnect() {
        if (!this.connection && !this.isClosed) {
            let isClosedByError = false;

            this.connection = new WebSocket(this.url, {
                headers: {
                    'X-Self-ID': this.coreContext.selfInfo.uin,
                    'Authorization': `Bearer ${this.token}`,
                    'x-client-role': 'Universal',  // koishi-adapter-onebot 需要这个字段
                    'User-Agent': 'OneBot/11',
                },

            });
            this.connection.on('message', (data) => {
                this.handleMessage(data);
            });
            this.connection.once('close', () => {
                if (!isClosedByError) {
                    this.logger.logError(`反向WebSocket (${this.url}) 连接意外关闭`);
                    this.logger.logError(`在 ${Math.floor(this.reconnectIntervalInMillis / 1000)} 秒后尝试重新连接`);
                    if (!this.isClosed) {
                        this.connection = null;
                        setTimeout(() => this.tryConnect(), this.reconnectIntervalInMillis);
                    }
                }
            });
            this.connection.on('error', (err) => {
                isClosedByError = true;
                this.logger.logError(`反向WebSocket (${this.url}) 连接错误`, err);
                this.logger.logError(`在 ${Math.floor(this.reconnectIntervalInMillis / 1000)} 秒后尝试重新连接`);
                if (!this.isClosed) {
                    this.connection = null;
                    setTimeout(() => this.tryConnect(), this.reconnectIntervalInMillis);
                }
            });
        }
    }

    private async handleMessage(message: any) {
        let receiveData: { action: ActionName, params?: any, echo?: any } = { action: ActionName.Unknown, params: {} };
        let echo = undefined;
        try {
            try {
                receiveData = JSON.parse(message.toString());
                echo = receiveData.echo;
                this.logger.logDebug('收到正向Websocket消息', receiveData);
            } catch (e) {
                this.checkStateAndReply<any>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo));
            }
            receiveData.params = (receiveData?.params) ? receiveData.params : {};//兼容类型验证
            const retdata = await this.actionMap.get(receiveData.action)
                ?.websocketHandle(receiveData.params, echo || '');
            const packet = Object.assign({}, retdata);
            this.checkStateAndReply<any>(packet);
        } catch (e) {
            this.checkStateAndReply<any>(OB11Response.error('不支持的api ' + receiveData.action, 1404, echo));
        }
    }
}
