import { ActionName } from '@/onebot/action/router';
import { OneBotAction, OneBotRequestToolkit } from '@/onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';

const SchemaData = Type.Object({
  error: Type.Optional(Type.Boolean({ default: false })),
});

type Payload = Static<typeof SchemaData>;

export class TestDownloadStream extends OneBotAction<Payload, StreamPacket<{ data: string }>> {
  override actionName = ActionName.TestDownloadStream;
  override payloadSchema = SchemaData;
  override useStream = true;

  async _handle (_payload: Payload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit) {
    for (let i = 0; i < 10; i++) {
      await req.send({ type: StreamStatus.Stream, data: `Index-> ${i + 1}`, data_type: 'data_chunk' });
      await new Promise(resolve => setTimeout(resolve, 100));
    }
    if (_payload.error) {
      throw new Error('This is a test error');
    }
    return {
      type: StreamStatus.Response,
      data_type: 'data_complete',
      data: 'Stream transmission complete',
    };
  }
}
