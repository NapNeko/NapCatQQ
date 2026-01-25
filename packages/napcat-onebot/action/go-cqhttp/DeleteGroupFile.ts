import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  file_id: Type.String({ description: '文件ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '删除结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class DeleteGroupFile extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GOCQHTTP_DeleteGroupFile;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '删除群文件';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.DeleteGroupFile.payload;

  async _handle (payload: PayloadType) {
    const data = FileNapCatOneBotUUID.decodeModelId(payload.file_id);
    if (!data || !data.fileId) throw new Error('Invalid file_id');
    return await this.core.apis.GroupApi.delGroupFile(payload.group_id.toString(), [data.fileId]);
  }
}
