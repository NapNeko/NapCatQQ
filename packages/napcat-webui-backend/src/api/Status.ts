import { statusHelperSubscription } from '@/napcat-webui-backend';
import type { Context } from 'hono';
import { SystemStatus } from 'napcat-common/src/status-interface';

export const StatusRealTimeHandler = async (_c: Context) => {
  let cleanup: (() => void) | undefined;
  const stream = new ReadableStream({
    start(controller) {
      const sendStatus = (status: SystemStatus) => {
        try {
          controller.enqueue(new TextEncoder().encode(`data: ${JSON.stringify(status)}\n\n`));
        } catch (e) {
          console.error(`An error occurred when writing sendStatus data to client: ${e}`);
        }
      };
      statusHelperSubscription.on('statusUpdate', sendStatus);
      cleanup = () => {
        statusHelperSubscription.off('statusUpdate', sendStatus);
      };
    },
    cancel() {
      if (cleanup) cleanup();
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Connection': 'keep-alive',
    },
  });
};
