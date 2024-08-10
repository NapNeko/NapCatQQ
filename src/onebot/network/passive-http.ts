import { IOB11NetworkAdapter } from './index';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import BaseAction from '@/onebot/action/BaseAction';
import express, { Express, Request, Response } from 'express';
import http from 'http';

export class OB11PassiveHttpAdapter implements IOB11NetworkAdapter {
    private app: Express | undefined;
    private server: http.Server | undefined;
    private isOpen: boolean = false;
    private hasBeenClosed: boolean = false;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();
    private port: number;

    constructor(port: number) {
        this.port = port;
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }
    registerHeartBeat() {
        //空心跳
    }
    onEvent<T extends OB11BaseEvent>(event: T) {
        // 事件处理逻辑可以在这里实现
    }

    open() {
        if (this.hasBeenClosed) {
            throw new Error('Cannot open a closed HTTP server');
        }
        if (!this.isOpen) {
            this.initializeServer();
            this.isOpen = true;
        }
    }

    private initializeServer() {
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(express.json());

        this.app.all('*', this.handleRequest.bind(this));

        this.server.listen(this.port, () => {
            console.log(`HTTP server listening on port ${this.port}`);
        });
    }

    private async handleRequest(req: Request, res: Response) {
        if (!this.isOpen) {
            res.status(503).send('Server is closed');
            return;
        }

        const actionName = req.path.split('/')[1];
        const action = this.actionMap.get(actionName);
        if (action) {
            try {
                const result = await action.handle(req.body);
                res.json(result);
            } catch (error) {
                res.status(500).send('Internal Server Error');
            }
        } else {
            res.status(404).send('Action not found');
        }
    }

    async close() {
        this.isOpen = false;
        this.hasBeenClosed = true;
        this.server?.close();
    }
}