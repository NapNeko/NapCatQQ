import { OB11EmitEventContent } from './index';
import { Request, Response } from 'express';
import { OB11HttpServerAdapter } from './http-server';

export class OB11HttpSSEServerAdapter extends OB11HttpServerAdapter {
    private sseClients: Response[] = [];

    override async handleRequest(req: Request, res: Response) {
        if (req.path === '/_events') {
            this.createSseSupport(req, res);
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

    override onEvent<T extends OB11EmitEventContent>(event: T) {
        this.sseClients.forEach((res) => {
            res.write(`data: ${JSON.stringify(event)}\n\n`);
        });
    }
}
