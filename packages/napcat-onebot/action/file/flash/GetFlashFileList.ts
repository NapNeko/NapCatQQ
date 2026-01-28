import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetFlashFileListPayloadSchema = Type.Object({
  fileset_id: Type.String({ description: '文件集 ID' }),
});

export type GetFlashFileListPayload = Static<typeof GetFlashFileListPayloadSchema>;

export class GetFlashFileList extends OneBotAction<GetFlashFileListPayload, any> {
  override actionName = ActionName.GetFlashFileList;
  override payloadSchema = GetFlashFileListPayloadSchema;
  override returnSchema = Type.Any({ description: '文件列表' });
  override actionSummary = '获取闪传文件列表';
  override actionTags = ['文件扩展'];
  override payloadExample = {
    fileset_id: 'set_123'
  };
  override returnExample = [
    {
      file_name: 'test.jpg',
      size: 1024
    }
  ];

  async _handle (payload: GetFlashFileListPayload) {
    return await this.core.apis.FlashApi.getFileListBySetId(payload.fileset_id);
  }
}
