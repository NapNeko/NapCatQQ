import { OB11EmitEventContent } from './index';
import { Request, Response } from 'express';
import { OB11Response } from '@/onebot/action/OneBotAction';
import { OB11PassiveHttpAdapter } from './passive-http';

export class OB11ActiveHttpSSEAdapter extends OB11PassiveHttpAdapter {
    private sseClients: Response[] = [];

    async handleRequest(req: Request, res: Response): Promise<any> {
        if (!this.isEnable) {
            this.core.context.logger.log(`[OneBot] [HTTP Server Adapter] Server is closed`);
            return res.json(OB11Response.error('Server is closed', 200));
        }

        let payload = req.body;
        if (req.method == 'get') {
            payload = req.query;
        } else if (req.query) {
            payload = { ...req.query, ...req.body };
        }
        if (req.path === '' || req.path === '/') {
            const hello = OB11Response.ok({});
            hello.message = 'NapCat4 Ss Running';
            return res.json(hello);
        }
        if (req.path === '/_events') {
            return this.createSseSupport(req, res);
        }
        const actionName = req.path.split('/')[1];
        const action = this.actions.get(actionName as any);
        if (action) {
            try {
                const result = await action.handle(payload, this.name);
                return res.json(result);
            } catch (error: any) {
                return res.json(OB11Response.error(error?.stack?.toString() || error?.message || 'Error Handle', 200));
            }
        } else {
            return res.json(OB11Response.error('不支持的Api ' + actionName, 200));
        }
    }

    private async createSseSupport(req: Request, res: Response) {
        res.setHeader('Content-Type', 'text/event-stream');
        res.setHeader('Cache-Control', 'no-cache');
        res.setHeader('Connection', 'keep-alive');
        res.flushHeaders();
        
        this.sseClients.push(res);
        req.on('close', () => {
            this.sseClients = this.sseClients.filter((client) => client !== res);
        });
    }

    onEvent<T extends OB11EmitEventContent>(event: T) {
        this.sseClients.forEach((res) => {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        });
    }
}
