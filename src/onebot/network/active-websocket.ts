import { IOB11NetworkAdapter } from '@/onebot/network/index';

import { WebSocket as NodeWebSocket } from 'ws';
import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import { sleep } from '@/common/utils/helper';

export class OB11ActiveWebSocketAdapter implements IOB11NetworkAdapter {
    url: string;
    reconnectIntervalInMillis: number;
    isClosed: boolean = false;

    private connection: NodeWebSocket | null = null;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();
    heartbeatInterval: number;

    constructor(url: string, reconnectIntervalInMillis: number, heartbeatInterval: number) {
        this.url = url;
        this.heartbeatInterval = heartbeatInterval;
        this.reconnectIntervalInMillis = reconnectIntervalInMillis;
    }

    registerHeartBeat() {
        //WS反向心跳
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }

    onEvent<T extends OB11BaseEvent>(event: T) {
        if (this.connection) {
            // this.connection.send(JSON.stringify(event));
            // TODO: wrap the event, and send the wrapped to the server.
            // TODO: consider using a utility function
        }
    }

    async open() {
        if (this.connection) {
            return;
        }
        await this.tryConnect();
    }

    close() {
        this.isClosed = true;
        if (this.isClosed) {
            throw new Error('Cannot close a closed WebSocket connection');
        }
        if (this.connection) {
            this.connection.close();
            this.connection = null;
        }
    }

    private async tryConnect() {
        while (!this.connection) {
            try {
                this.connection = new NodeWebSocket(this.url);
            } catch (e) {
                this.connection = null;
                console.error('Failed to connect to the server, retrying in 5 seconds...');
                await sleep(5000);
            }
        }

        this.connection.on('message', (data) => {
            // TODO: extract action name and payload from the message, then call the corresponding action.
            // TODO: consider using a utility function
        });

        this.connection.once('close', () => {
            if (!this.isClosed) {
                this.connection = new NodeWebSocket(this.url);
                this.tryConnect();
            }
        });
    }
}
