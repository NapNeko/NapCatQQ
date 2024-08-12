import { IOB11NetworkAdapter, OB11EmitEventContent } from './index';
import BaseAction from '@/onebot/action/BaseAction';
import express, { Express, Request, Response } from 'express';
import http from 'http';
import { NapCatCore } from '@/core';
import { OB11Response } from '../action/OB11Response';
import { NapCatOneBot11Adapter } from '@/onebot';

export class OB11PassiveHttpAdapter implements IOB11NetworkAdapter {
    token: string;
    coreContext: NapCatCore;
    obContext: NapCatOneBot11Adapter;
    private app: Express | undefined;
    private server: http.Server | undefined;
    private isOpen: boolean = false;
    private actionMap: Map<string, BaseAction<any, any>> = new Map();
    private port: number;

    constructor(port: number, token: string, coreContext: NapCatCore, onebotContext: NapCatOneBot11Adapter) {
        this.port = port;
        this.token = token;
        this.coreContext = coreContext;
        this.obContext = onebotContext;
    }

    registerAction<T extends BaseAction<P, R>, P, R>(action: T) {
        this.actionMap.set(action.actionName, action);
    }

    registerActionMap(actionMap: Map<string, BaseAction<any, any>>) {
        this.actionMap = actionMap;
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        // 事件处理逻辑可以在这里实现
    }

    open() {
        try {
            if (this.isOpen) {
                this.coreContext.context.logger.logError('Cannot open a closed HTTP server');
                return;
            }
            if (!this.isOpen) {
                this.initializeServer();
                this.isOpen = true;
            }
        } catch (e) {
            this.coreContext.context.logger.logError(`[OneBot] [HTTP Server Adapter] Boot Error: ${e}`);
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

        this.app.use(express.json());
        this.app.use(express.urlencoded({ extended: false }));
        this.app.use((req, res, next) => this.authorize(this.token, req, res, next));
        this.app.use((req, res) => this.handleRequest(req, res));

        this.server.listen(this.port, () => {
            this.coreContext.context.logger.log(`[OneBot] [HTTP Server Adapter] Start On Port ${this.port}`);
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
            this.coreContext.context.logger.log(`[OneBot] [HTTP Server Adapter] Server is closed`);
            return res.json(OB11Response.error('Server is closed', 200));
        }

        let payload = req.body;
        if (req.method == 'get') {
            payload = req.query;
        } else if (req.query) {
            payload = { ...req.query, ...req.body };
        }

        const actionName = req.path.split('/')[1];
        const action = this.actionMap.get(actionName);
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
