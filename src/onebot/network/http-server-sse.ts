import { OB11EmitEventContent } from './index';
import { OB11HttpServerAdapter } from './http-server';
import { Context } from 'hono';
import { SSEStreamingApi, streamSSE } from 'hono/streaming';
import { Mutex } from 'async-mutex';

export class OB11HttpSSEServerAdapter extends OB11HttpServerAdapter {
    private sseClients: { context: Context; stream: SSEStreamingApi }[] = [];
    private mutex = new Mutex();
    override async httpApiRequest(c: Context): Promise<any> {
        if (c.req.path === '/_events') {
            return await this.createSseSupport(c);
        } else {
            return super.httpApiRequest(c);
        }
    }

    private async createSseSupport(c: Context) {
        return streamSSE(c, async (stream) => {
            this.mutex.runExclusive(async () => {
                this.sseClients.push({ context: c, stream });
                stream.onAbort(() => {
                    this.sseClients = this.sseClients.filter(({ stream: s }) => s !== stream);
                });
            });
        })
    }

    override onEvent<T extends OB11EmitEventContent>(event: T) {
        this.mutex.runExclusive(async () => {
            this.sseClients.forEach(({ stream }) => {
                stream.writeSSE({ data: JSON.stringify(event) });
            });
        });
    }
}