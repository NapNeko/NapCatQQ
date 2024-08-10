import { IOB11NetworkAdapter, OB11EmitEventContent } from './index';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import BaseAction from '@/onebot/action/BaseAction';
import { WebSocket, WebSocketServer } from 'ws';
import { Mutex } from 'async-mutex';

export class OB11PassiveWebSocketAdapter implements IOB11NetworkAdapter {
    wsServer: WebSocketServer;
    wsClients: WebSocket[] = [];
    wsClientsMutex = new Mutex();
    isOpen: boolean = false;
    hasBeenClosed: boolean = false;
    heartbeatInterval: number = 0;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();

    constructor(ip: string, port: number, heartbeatInterval: number, token: string) {
        this.heartbeatInterval = heartbeatInterval;
        this.wsServer = new WebSocketServer({ port: port, host: ip });
        this.wsServer.on('connection', async (wsClient) => {
            if (!this.isOpen) {
                wsClient.close();
                return;
            }
            if (token) {
                const incomingToken = wsClient.url.split('?')[1]?.split('=')[1];
                if (incomingToken !== token) {
                    wsClient.close();
                    return;
                }
            }
            wsClient.on('message', (message) => {
                this.handleMessage(message);
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
        setInterval(() => {
            this.wsClientsMutex.runExclusive(async () => {
                this.wsClients.forEach((wsClient) => {
                    if (wsClient.readyState === WebSocket.OPEN) {
                        wsClient.ping();
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
            throw new Error('Cannot open a closed WebSocket server');
        }
        this.isOpen = true;
    }

    async close() {
        this.isOpen = false;
        this.hasBeenClosed = true;
        this.wsServer.close();
    }

    private handleMessage(message: any) {
        try {
            const parsedMessage = JSON.parse(message);
            const action = this.actionMap.get(parsedMessage.actionName);
            if (action) {
                action.handle(parsedMessage.payload);
            }
        } catch (e) {
            console.error('Failed to handle message:', e);
        }
    }

    private wrapEvent<T extends OB11EmitEventContent>(event: T) {
        return {
            type: 'event',
            data: event
        };
    }
}

