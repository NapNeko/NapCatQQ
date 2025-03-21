import { OB11EmitEventContent } from './index';
import { OB11HttpServerAdapter } from './http-server';
import { Context } from 'hono';
import { SSEStreamingApi, streamSSE } from 'hono/streaming';
import { Mutex } from 'async-mutex';

export class OB11HttpSSEServerAdapter extends OB11HttpServerAdapter {
    private sseClients: { context: Context; stream: SSEStreamingApi, mutex: Mutex }[] = [];

    override async actionHandler(c: Context): Promise<any> {
        if (c.req.path === '/_events') {
            return await this.createSseSupport(c);
        } else {
            return super.actionHandler(c);
        }
    }

    private async createSseSupport(c: Context) {
        return streamSSE(c, async (stream) => {
            const client = { context: c, stream, mutex: new Mutex() };
            this.sseClients.push(client);
            client.mutex.acquire();

            stream.onAbort(() => {
                this.removeClient(stream);
                client.mutex.release();
            });

            await stream.writeSSE({ data: JSON.stringify({ status: 'connect' }) });
            await client.mutex.waitForUnlock();
        });
    }

    private removeClient(stream: SSEStreamingApi) {
        const index = this.sseClients.findIndex(client => client.stream === stream);
        if (index !== -1) {
            this.sseClients.splice(index, 1);
        }
    }

    override onEvent<T extends OB11EmitEventContent>(event: T) {
        const eventData = JSON.stringify(event);

        Promise.all(
            this.sseClients.map(async ({ stream, mutex }) => {
                try {
                    await stream.writeSSE({ data: eventData });
                } catch (error) {
                    mutex.release();
                    this.removeClient(stream);
                }
            })
        ).then().catch((error) => {
            this.core.context.logger.logError('Error sending SSE event:', error);
        });

    }
}