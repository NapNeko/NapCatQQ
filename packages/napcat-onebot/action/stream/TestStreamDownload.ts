import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction, OneBotRequestToolkit } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NetworkAdapterConfig } from '@/napcat-onebot/config/config';
import { StreamPacket, StreamStatus } from './StreamBasic';

export const TestDownloadStreamPayloadSchema = Type.Object({
  error: Type.Optional(Type.Boolean({ default: false, description: '是否触发测试错误' })),
});

export type TestDownloadStreamPayload = Static<typeof TestDownloadStreamPayloadSchema>;

export class TestDownloadStream extends OneBotAction<TestDownloadStreamPayload, StreamPacket<{ data: string; }>> {
  override actionName = ActionName.TestDownloadStream;
  override payloadSchema = TestDownloadStreamPayloadSchema;
  override returnSchema = Type.Any({ description: '测试流数据' });
  override useStream = true;

  async _handle (_payload: TestDownloadStreamPayload, _adaptername: string, _config: NetworkAdapterConfig, req: OneBotRequestToolkit) {
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
