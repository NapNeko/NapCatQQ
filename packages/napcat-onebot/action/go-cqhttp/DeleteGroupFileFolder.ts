import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { Static, Type } from '@sinclair/typebox';
import { NTQQGroupApi } from 'napcat-core/apis';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
  folder_id: Type.Optional(Type.String({ description: '文件夹ID' })),
  folder: Type.Optional(Type.String({ description: '文件夹ID' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '删除结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class DeleteGroupFileFolder extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_DeleteGroupFileFolder;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  async _handle (payload: PayloadType) {
    return (await this.core.apis.GroupApi.delGroupFileFolder(
      payload.group_id.toString(), payload.folder ?? payload.folder_id ?? '')).groupFileCommonResult;
  }
}
