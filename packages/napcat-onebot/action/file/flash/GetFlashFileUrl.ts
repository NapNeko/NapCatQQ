import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetFlashFileUrlPayloadSchema = Type.Object({
  fileset_id: Type.String({ description: '文件集 ID' }),
  file_name: Type.Optional(Type.String({ description: '文件名' })),
  file_index: Type.Optional(Type.Number({ description: '文件索引' })),
});

export type GetFlashFileUrlPayload = Static<typeof GetFlashFileUrlPayloadSchema>;

export class GetFlashFileUrl extends OneBotAction<GetFlashFileUrlPayload, any> {
  override actionName = ActionName.GetFlashFileUrl;
  override payloadSchema = GetFlashFileUrlPayloadSchema;
  override returnSchema = Type.Any({ description: '文件下载链接' });

  async _handle (payload: GetFlashFileUrlPayload) {
    // 文件的索引依旧从0开始
    return await this.core.apis.FlashApi.getFileTransUrl(payload.fileset_id, {
      fileName: payload.file_name,
      fileIndex: payload.file_index,
    });
  }
}
