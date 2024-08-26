import { IOB11NetworkAdapter, OB11EmitEventContent } from './index';
import express, { Express, Request, Response } from 'express';
import http from 'http';
import { NapCatCore } from '@/core';
import { OB11Response } from '../action/OB11Response';
import { ActionMap } from '@/onebot/action';
import cors from 'cors';

export class OB11PassiveHttpAdapter implements IOB11NetworkAdapter {
    private app: Express | undefined;
    private server: http.Server | undefined;
    private isOpen: boolean = false;

    constructor(
        public port: number,
        public token: string,
        public core: NapCatCore,
        public actions: ActionMap,
    ) {
    }

    onEvent() {
        // http server is passive, no need to emit event
    }

    open() {
        try {
            if (this.isOpen) {
                this.core.context.logger.logError('Cannot open a closed HTTP server');
                return;
            }
            if (!this.isOpen) {
                this.initializeServer();
                this.isOpen = true;
            }
        } catch (e) {
            this.core.context.logger.logError(`[OneBot] [HTTP Server Adapter] Boot Error: ${e}`);
        }

    }

    async close() {
        this.isOpen = false;
        this.server?.close();
        this.app = undefined;
    }
    private initializeServer() {
        this.app = express();
        this.server = http.createServer(this.app);

        this.app.use(cors());
        this.app.use(express.urlencoded({ extended: true, limit: '5000mb' }));
        this.app.use((req, res, next) => {
            // 兼容处理没有带content-type的请求
            req.headers['content-type'] = 'application/json';
            const originalJson = express.json({ limit: '5000mb' });
            originalJson(req, res, (err) => {
                if (err) {
                    return res.status(400).send('Invalid JSON');
                }
                next();
            });
        });

        this.app.use((req, res, next) => this.authorize(this.token, req, res, next));
        this.app.use((req, res) => this.handleRequest(req, res));

        this.server.listen(this.port, () => {
            this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] Start On Port ${this.port}`);
        });
    }

    private authorize(token: string | undefined, req: Request, res: Response, next: any) {
        if (!token || token.length == 0) return next();//客户端未设置密钥
        const HeaderClientToken = req.headers.authorization?.split('Bearer ').pop() || '';
        const QueryClientToken = req.query.access_token;
        const ClientToken = typeof (QueryClientToken) === 'string' && QueryClientToken !== '' ? QueryClientToken : HeaderClientToken;
        if (ClientToken === token) {
            return next();
        } else {
            return res.status(403).send(JSON.stringify({ message: 'token verify failed!' }));
        }
    }

    private async handleRequest(req: Request, res: Response) {
        if (!this.isOpen) {
            this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] Server is closed`);
            return res.json(OB11Response.error('Server is closed', 200));
        }

        let payload = req.body;
        if (req.method == 'get') {
            payload = req.query;
        } else if (req.query) {
            payload = { ...req.query, ...req.body };
        }

        const actionName = req.path.split('/')[1];
        const action = this.actions.get(actionName);
        if (action) {
            try {
                const result = await action.handle(payload);
                return res.json(result);
            } catch (error: any) {
                return res.json(OB11Response.error(error?.stack?.toString() || error?.message || 'Error Handle', 200));
            }
        } else {
            return res.json(OB11Response.error('不支持的api ' + actionName, 200));
        }
    }
}
