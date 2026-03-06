import { OB11EmitEventContent } from './index';
import type { Context } from 'hono';
import type { HttpBindings } from '@hono/node-server';
import { streamSSE } from 'hono/streaming';
import { OB11HttpServerAdapter } from './http-server';

type Env = { Bindings: HttpBindings; Variables: { parsedBody: any } };

interface SSEWriter {
  write: (data: string) => Promise<void>;
  close: () => void;
}

export class OB11HttpSSEServerAdapter extends OB11HttpServerAdapter {
  private sseWriters: SSEWriter[] = [];

  override get isActive (): boolean {
    return this.isEnable && (this.sseWriters.length > 0 || super.isActive);
  }

  override async handleRequest (c: Context<Env>): Promise<Response> {
    const path = new URL(c.req.url).pathname;
    if (path === '/_events') {
      return this.createSseSupport(c);
    } else {
      return super.httpApiRequest(c, true);
    }
  }

  private createSseSupport (c: Context<Env>): Response {
    return streamSSE(c, async (stream) => {
      const writer: SSEWriter = {
        write: async (data: string) => {
          await stream.writeSSE({ data });
        },
        close: () => {
          stream.close();
        },
      };

      this.sseWriters.push(writer);

      stream.onAbort(() => {
        this.sseWriters = this.sseWriters.filter((w) => w !== writer);
      });

      await new Promise<void>((resolve) => {
        stream.onAbort(resolve);
      });
    });
  }

  override async onEvent<T extends OB11EmitEventContent> (event: T) {
    super.onEvent(event);
    const promises: Promise<void>[] = [];
    this.sseWriters.forEach((writer) => {
      promises.push(writer.write(JSON.stringify(event)));
    });
    await Promise.allSettled(promises);
  }
}
