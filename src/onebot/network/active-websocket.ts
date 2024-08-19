import { IOB11NetworkAdapter, OB11EmitEventContent } from '@/onebot/network/index';
import { WebSocket } from 'ws';
import { OB11HeartbeatEvent } from '../event/meta/OB11HeartbeatEvent';
import { NapCatCore } from '@/core';
import { ActionName } from '@/onebot/action/types';
import { OB11Response } from '@/onebot/action/OB11Response';
import { LogWrapper } from '@/common/utils/log';
import { ActionMap } from '@/onebot/action';
import { LifeCycleSubType, OB11LifeCycleEvent } from '../event/meta/OB11LifeCycleEvent';

export class OB11ActiveWebSocketAdapter implements IOB11NetworkAdapter {
    isClosed: boolean = false;
    logger: LogWrapper;
    private connection: WebSocket | null = null;
    private heartbeatRef: NodeJS.Timeout | null = null;

    constructor(
        public url: string,
        public reconnectIntervalInMillis: number,
        public heartbeatIntervalInMillis: number,
        private token: string,
        public coreContext: NapCatCore,
        public actions: ActionMap,
    ) {
        this.logger = coreContext.context.logger;
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        if (this.connection && this.connection.readyState === WebSocket.OPEN) {
            this.connection.send(JSON.stringify(event));
        }
    }

    async open() {
        if (this.connection) {
            return;
        }
        this.heartbeatRef = setInterval(() => {
            if (this.connection && this.connection.readyState === WebSocket.OPEN) {
                this.connection.send(JSON.stringify(new OB11HeartbeatEvent(this.coreContext, this.heartbeatIntervalInMillis, this.coreContext.selfInfo.online, true)));
            }
        }, this.heartbeatIntervalInMillis);
        await this.tryConnect();
    }

    close() {
        if (this.isClosed) {
            this.logger.logDebug('Cannot close a closed WebSocket connection');
            return;
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
                maxPayload: 1024 * 1024 * 1024,
                headers: {
                    'X-Self-ID': this.coreContext.selfInfo.uin,
                    'Authorization': `Bearer ${this.token}`,
                    'x-client-role': 'Universal',  // koishi-adapter-onebot 需要这个字段
                    'User-Agent': 'OneBot/11',
                },

            });
            this.connection.on('ping', () => {
                this.connection?.pong();
            });
            this.connection.on('pong', () => {
                //this.logger.logDebug('[OneBot] [WebSocket Client] 收到pong');
            });
            this.connection.on('open', () => {
                try {
                    this.connectEvent(this.coreContext);
                } catch (e) {
                    this.logger.logError('[OneBot] [WebSocket Client] 发送连接生命周期失败', e);
                }

            });
            this.connection.on('message', (data) => {
                this.handleMessage(data);
            });
            this.connection.once('close', () => {
                if (!isClosedByError) {
                    this.logger.logError(`[OneBot] [WebSocket Client] 反向WebSocket (${this.url}) 连接意外关闭`);
                    this.logger.logError(`[OneBot] [WebSocket Client] 在 ${Math.floor(this.reconnectIntervalInMillis / 1000)} 秒后尝试重新连接`);
                    if (!this.isClosed) {
                        this.connection = null;
                        setTimeout(() => this.tryConnect(), this.reconnectIntervalInMillis);
                    }
                }
            });
            this.connection.on('error', (err) => {
                isClosedByError = true;
                this.logger.logError(`[OneBot] [WebSocket Client] 反向WebSocket (${this.url}) 连接错误`, err);
                this.logger.logError(`[OneBot] [WebSocket Client] 在 ${Math.floor(this.reconnectIntervalInMillis / 1000)} 秒后尝试重新连接`);
                if (!this.isClosed) {
                    this.connection = null;
                    setTimeout(() => this.tryConnect(), this.reconnectIntervalInMillis);
                }
            });
        }
    }
    connectEvent(core: NapCatCore) {
        try {
            this.checkStateAndReply<any>(new OB11LifeCycleEvent(core, LifeCycleSubType.CONNECT));
        } catch (e) {
            this.logger.logError('[OneBot] [WebSocket Client] 发送生命周期失败', e);
        }
    }
    private async handleMessage(message: any) {
        let receiveData: { action: ActionName, params?: any, echo?: any } = { action: ActionName.Unknown, params: {} };
        let echo = undefined;
        try {
            try {
                receiveData = JSON.parse(message.toString());
                echo = receiveData.echo;
                this.logger.logDebug('[OneBot] [WebSocket Client] 收到正向Websocket消息', receiveData);
            } catch (e) {
                this.checkStateAndReply<any>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo));
            }
            receiveData.params = (receiveData?.params) ? receiveData.params : {};//兼容类型验证
            const retdata = await this.actions.get(receiveData.action)
                ?.websocketHandle(receiveData.params, echo || '');
            const packet = Object.assign({}, retdata);
            this.checkStateAndReply<any>(packet);
        } catch (e) {
            this.logger.logError('[OneBot] [WebSocket Client] 发生错误', e);
            this.checkStateAndReply<any>(OB11Response.error('不支持的api ' + receiveData.action, 1404, echo));
        }
    }
}
