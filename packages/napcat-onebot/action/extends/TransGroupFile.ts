import { ActionName } from '@/napcat-onebot/action/router';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
  file_id: Type.String({ description: '文件ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  ok: Type.Boolean({ description: '是否成功' }),
}, { description: '转发文件结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class TransGroupFile extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.TransGroupFile;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
    if (contextMsgFile?.fileUUID) {
      const result = await this.core.apis.GroupApi.transGroupFile(payload.group_id.toString(), contextMsgFile.fileUUID);
      if (result.transGroupFileResult.result.retCode === 0) {
        return {
          ok: true,
        };
      }
      throw new Error(result.transGroupFileResult.result.retMsg);
    }
    throw new Error('real fileUUID not found!');
  }
}
