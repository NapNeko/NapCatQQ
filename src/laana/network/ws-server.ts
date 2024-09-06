import { ILaanaNetworkAdapter } from '../network/index';
import { NapCatLaanaAdapter } from '..';
import { LaanaDataWrapper } from '../types/laana';
import { EventWrapper } from '../types/event/wrapper';
import { RawData, WebSocket, WebSocketServer } from 'ws';
import { Mutex } from 'async-mutex';
import { NapCatCore } from '@/core';
import { Message as LaanaMessage } from '../types/entity/message';

export class LaanaWsServerAdapter implements ILaanaNetworkAdapter {
    wsServer: WebSocketServer;
    wsClients: WebSocket[] = [];
    wsClientsMutex = new Mutex();
    isOpen: boolean = false;
    hasBeenClosed: boolean = false;
    private heartbeatIntervalId: NodeJS.Timeout | null = null;

    constructor(
        public ip: string,
        public port: number,
        public enableHeartbeat: boolean,
        public heartbeatInterval: number,
        public token: string,
        public core: NapCatCore,
        public laana: NapCatLaanaAdapter,
    ) {
        this.wsServer = new WebSocketServer({
            port: port,
            host: ip,
        });
        this.wsServer.on('connection', async (wsClient) => {
            if (!this.isOpen) {
                wsClient.close();
                return;
            }

            wsClient.on('error', (err) => this.core.context.logger.log('[OneBot] [WebSocket Server] Client Error:', err.message));

            wsClient.on('message', (message) => {
                let binaryData: Uint8Array;
                if (message instanceof Buffer) {
                    binaryData = message;
                } else if (message instanceof ArrayBuffer) {
                    binaryData = new Uint8Array(message);
                } else { // message is an array of Buffers
                    binaryData = Buffer.concat(message);
                }
                this.wsClientsMutex.runExclusive(async () => {
                    const data = LaanaDataWrapper.fromBinary(
                        Uint8Array.from(binaryData),
                    );
                    if (data.data.oneofKind === 'actionPing') {
                        const actionName = data.data.actionPing.ping.oneofKind;
                        if (actionName === undefined) {
                            this.core.context.logger.logError('未知的动作名', actionName);
                            return;
                        }

                        const actionHandler = this.laana.actions[actionName];
                        if (!actionHandler) {
                            this.core.context.logger.logError('未实现的动作名', actionName);
                            return;
                        }
                        try {
                            // eslint-disable-next-line
                            // @ts-ignore
                            const ret = await actionHandler(data.data.actionPing.ping[actionName]);
                            this.checkStateAndReply(LaanaDataWrapper.toBinary({
                                data: {
                                    oneofKind: 'actionPong',
                                    actionPong: {
                                        clientPingId: data.data.actionPing.clientPingId,
                                        // eslint-disable-next-line
                                        // @ts-ignore
                                        pong: {
                                            oneofKind: actionName,
                                            [actionName]: ret,
                                        },
                                    },
                                },
                            }), wsClient);
                        } catch (e: any) {
                            this.core.context.logger.logError('处理动作时出现错误', e);
                            this.checkStateAndReply(LaanaDataWrapper.toBinary({
                                data: {
                                    oneofKind: 'actionPong',
                                    actionPong: {
                                        clientPingId: data.data.actionPing.clientPingId,
                                        pong: {
                                            oneofKind: 'failed',
                                            failed: {
                                                reason: e.toString(),
                                            }
                                        },
                                    },
                                },
                            }), wsClient);
                        }
                    } else {
                        this.core.context.logger.logWarn('未知的数据包类型', data.data.oneofKind);
                    }
                }).catch((e) => this.core.context.logger.logError('处理请求时出现错误', e));
            });

            wsClient.on('ping', () => {
                wsClient.pong();
            });

            wsClient.once('close', () => {
                this.wsClientsMutex.runExclusive(async () => {
                    this.wsClients = this.wsClients.filter(client => client !== wsClient);
                });
            });

            await this.wsClientsMutex.runExclusive(async () => {
                this.wsClients.push(wsClient);
            });
        });

        this.wsServer.on('error', (err) => {
            this.core.context.logger.log('开启 WebSocket 服务器时出现错误', err);
        });
    }

    onEvent(event: EventWrapper) {
        this.wsClientsMutex.runExclusive(() => {
            this.wsClients.forEach(wsClient => {
                this.checkStateAndReply(LaanaDataWrapper.toBinary({
                    data: {
                        oneofKind: 'event',
                        event: event,
                    },
                }), wsClient);
            });
        }).catch((e) => this.core.context.logger.logError('事件发送失败', e));
    }

    onMessage(message: LaanaMessage) {
        this.wsClientsMutex.runExclusive(() => {
            this.wsClients.forEach(wsClient => {
                this.checkStateAndReply(LaanaDataWrapper.toBinary({
                    data: {
                        oneofKind: 'message',
                        message: message,
                    },
                }), wsClient);
            });
        }).catch((e) => this.core.context.logger.logError('消息发送失败', e));
    }

    open() {
        if (this.isOpen || this.hasBeenClosed) {
            throw Error('不能重复打开 WebSocket 服务器');
        }

        const addressInfo = this.wsServer.address();
        this.core.context.logger.log(
            'WebSocket 服务器已开启',
            typeof (addressInfo) === 'string' ?
                addressInfo :
                addressInfo?.address + ':' + addressInfo?.port
        );

        this.isOpen = true;
    }

    async close() {
        this.isOpen = false;
        this.wsServer.close();
        if (this.heartbeatIntervalId) {
            clearInterval(this.heartbeatIntervalId);
            this.heartbeatIntervalId = null;
        }
    }

    private checkStateAndReply(data: RawData, wsClient: WebSocket) {
        if (wsClient.readyState === WebSocket.OPEN) {
            wsClient.send(data);
        }
    }
}
