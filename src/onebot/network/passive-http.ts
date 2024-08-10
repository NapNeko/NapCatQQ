import { IOB11NetworkAdapter } from './index';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import BaseAction from '@/onebot/action/BaseAction';
import { Mutex } from 'async-mutex';
import express, { Express, Request, Response } from 'express';
import http from 'http';

export class OB11PassiveHttpAdapter implements IOB11NetworkAdapter {
    private app: Express;
    private server: http.Server;
    private clients: { res: Response }[] = [];
    private clientsMutex = new Mutex();
    private isOpen: boolean = false;
    private hasBeenClosed: boolean = false;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();

    constructor(port: number) {
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(express.json());

        this.app.post('/action', async (req: Request, res: Response) => {
            if (!this.isOpen) {
                res.status(503).send('Server is closed');
                return;
            }

            const { actionName, payload } = req.body;
            const action = this.actionMap.get(actionName);
            if (action) {
                const result = await action.handle(payload);
                res.json(result);
            } else {
                res.status(404).send('Action not found');
            }
        });

        this.app.post('/event', (req: Request, res: Response) => {
            this.clientsMutex.runExclusive(async () => {
                this.clients.push({ res });
            });
        });

        this.server.listen(port, () => {
            console.log(`HTTP server listening on port ${port}`);
        });
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }

    onEvent<T extends OB11BaseEvent>(event: T) {
        this.clientsMutex.runExclusive(async () => {
            this.clients.forEach(({ res }) => {
                res.json(event);
            });
            this.clients = [];
        });
    }

    open() {
        if (this.hasBeenClosed) {
            throw new Error('Cannot open a closed HTTP server');
        }
        this.isOpen = true;
    }

    async close() {
        this.isOpen = false;
        this.hasBeenClosed = true;
        this.server.close();
    }
}