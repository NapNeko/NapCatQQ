import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const DownloadFilesetPayloadSchema = Type.Object({
  fileset_id: Type.String({ description: '文件集 ID' }),
});

export type DownloadFilesetPayload = Static<typeof DownloadFilesetPayloadSchema>;

export class DownloadFileset extends OneBotAction<DownloadFilesetPayload, any> {
  override actionName = ActionName.DownloadFileset;
  override payloadSchema = DownloadFilesetPayloadSchema;
  override returnSchema = Type.Any({ description: '下载结果' });
  override actionSummary = '下载文件集';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    fileset_id: 'set_123'
  };
  override returnExample = null;

  async _handle (payload: DownloadFilesetPayload) {
    // 默认路径 / fileset_id /为下载路径
    return await this.core.apis.FlashApi.downloadFileSetBySetId(payload.fileset_id);
  }
}
