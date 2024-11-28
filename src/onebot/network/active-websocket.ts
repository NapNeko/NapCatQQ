import { IOB11NetworkAdapter, OB11EmitEventContent, OB11NetworkReloadType } from '@/onebot/network/index';
import { WebSocket } from 'ws';
import { OB11HeartbeatEvent } from '@/onebot/event/meta/OB11HeartbeatEvent';
import { NapCatCore } from '@/core';
import { ActionName } from '@/onebot/action/router';
import { OB11Response } from '@/onebot/action/OneBotAction';
import { LogWrapper } from '@/common/log';
import { ActionMap } from '@/onebot/action';
import { LifeCycleSubType, OB11LifeCycleEvent } from '@/onebot/event/meta/OB11LifeCycleEvent';
import { WebsocketClientConfig } from '@/onebot/config/config';

export class OB11ActiveWebSocketAdapter implements IOB11NetworkAdapter {
    isEnable: boolean = false;
    logger: LogWrapper;
    private connection: WebSocket | null = null;
    private heartbeatRef: NodeJS.Timeout | null = null;
    public config: WebsocketClientConfig;

    constructor(
        public name: string,
        confg: WebsocketClientConfig,
        public core: NapCatCore,
        public actions: ActionMap,
    ) {
        this.logger = core.context.logger;
        this.config = structuredClone(confg);
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
        if (this.config.heartInterval > 0) {
            this.heartbeatRef = setInterval(() => {
                if (this.connection && this.connection.readyState === WebSocket.OPEN) {
                    this.connection.send(JSON.stringify(new OB11HeartbeatEvent(this.core, this.config.heartInterval, this.core.selfInfo.online ?? true, true)));
                }
            }, this.config.heartInterval);
        }
        this.isEnable = true;
        await this.tryConnect();
    }

    close() {
        if (!this.isEnable) {
            this.logger.logDebug('Cannot close a closed WebSocket connection');
            return;
        }
        this.isEnable = false;
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
        if (!this.connection && this.isEnable) {
            let isClosedByError = false;

            this.connection = new WebSocket(this.config.url, {
                maxPayload: 1024 * 1024 * 1024,
                handshakeTimeout: 2000,
                perMessageDeflate: false,
                headers: {
                    'X-Self-ID': this.core.selfInfo.uin,
                    'Authorization': `Bearer ${this.config.token}`,
                    'x-client-role': 'Universal',  // 为koishi adpter适配
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
                    this.connectEvent(this.core);
                } catch (e) {
                    this.logger.logError('[OneBot] [WebSocket Client] 发送连接生命周期失败', e);
                }

            });
            this.connection.on('message', (data) => {
                this.handleMessage(data);
            });
            this.connection.once('close', () => {
                if (!isClosedByError) {
                    this.logger.logError(`[OneBot] [WebSocket Client] 反向WebSocket (${this.config.url}) 连接意外关闭`);
                    this.logger.logError(`[OneBot] [WebSocket Client] 在 ${Math.floor(this.config.reconnectInterval / 1000)} 秒后尝试重新连接`);
                    if (this.isEnable) {
                        this.connection = null;
                        setTimeout(() => this.tryConnect(), this.config.reconnectInterval);
                    }
                }
            });
            this.connection.on('error', (err) => {
                isClosedByError = true;
                this.logger.logError(`[OneBot] [WebSocket Client] 反向WebSocket (${this.config.url}) 连接错误`, err);
                this.logger.logError(`[OneBot] [WebSocket Client] 在 ${Math.floor(this.config.reconnectInterval / 1000)} 秒后尝试重新连接`);
                if (this.isEnable) {
                    this.connection = null;
                    setTimeout(() => this.tryConnect(), this.config.reconnectInterval);
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
            receiveData = JSON.parse(message.toString());
            echo = receiveData.echo;
            this.logger.logDebug('[OneBot] [WebSocket Client] 收到正向Websocket消息', receiveData);
        } catch (e) {
            this.checkStateAndReply<any>(OB11Response.error('json解析失败,请检查数据格式', 1400, echo));
            return;
        }
        receiveData.params = (receiveData?.params) ? receiveData.params : {};// 兼容类型验证
        const action = this.actions.get(receiveData.action);
        if (!action) {
            this.logger.logError('[OneBot] [WebSocket Client] 发生错误', '不支持的Api ' + receiveData.action);
            this.checkStateAndReply<any>(OB11Response.error('不支持的Api ' + receiveData.action, 1404, echo));
            return;
        }
        const retdata = await action.websocketHandle(receiveData.params, echo ?? '', this.name);
        this.checkStateAndReply<any>({ ...retdata });
    }
    async reload(newConfig: WebsocketClientConfig) {
        const wasEnabled = this.isEnable;
        const oldUrl = this.config.url;
        const oldHeartInterval = this.config.heartInterval;
        this.config = newConfig;

        if (newConfig.enable && !wasEnabled) {
            this.open();
            return OB11NetworkReloadType.NetWorkOpen;
        } else if (!newConfig.enable && wasEnabled) {
            this.close();
            return OB11NetworkReloadType.NetWorkClose;
        }

        if (oldUrl !== newConfig.url) {
            this.close();
            if (newConfig.enable) {
                this.open();
            }
            return OB11NetworkReloadType.NetWorkReload;
        }

        if (oldHeartInterval !== newConfig.heartInterval) {
            if (this.heartbeatRef) {
                clearInterval(this.heartbeatRef);
                this.heartbeatRef = null;
            }
            if (newConfig.heartInterval > 0 && this.isEnable) {
                this.heartbeatRef = setInterval(() => {
                    if (this.connection && this.connection.readyState === WebSocket.OPEN) {
                        this.connection.send(JSON.stringify(new OB11HeartbeatEvent(this.core, newConfig.heartInterval, this.core.selfInfo.online ?? true, true)));
                    }
                }, newConfig.heartInterval);
            }
            return OB11NetworkReloadType.NetWorkReload;
        }

        return OB11NetworkReloadType.Normal;
    }
}
