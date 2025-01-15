import { OB11EmitEventContent } from './index';
import { Request, Response } from 'express';
import { OB11Response } from '@/onebot/action/OneBotAction';
import { OB11PassiveHttpAdapter } from './passive-http';

export class OB11ActiveHttpSSEAdapter extends OB11PassiveHttpAdapter {
    private sseClients: Response[] = [];

    async handleRequest(req: Request, res: Response): Promise<any> {
        if (req.path === '/_events') {
            return this.createSseSupport(req, res);
        } else {
            super.httpApiRequest(req, res);
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
