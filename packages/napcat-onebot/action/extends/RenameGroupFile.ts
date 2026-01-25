import { ActionName } from '@/napcat-onebot/action/router';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
  file_id: Type.String({ description: '文件ID' }),
  current_parent_directory: Type.String({ description: '当前父目录' }),
  new_name: Type.String({ description: '新文件名' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  ok: Type.Boolean({ description: '是否成功' }),
}, { description: '重命名文件结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class RenameGroupFile extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.RenameGroupFile;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
    if (contextMsgFile?.fileUUID) {
      await this.core.apis.PacketApi.pkt.operation.RenameGroupFile(+payload.group_id, contextMsgFile.fileUUID, payload.current_parent_directory, payload.new_name);
      return {
        ok: true,
      };
    }
    throw new Error('real fileUUID not found!');
  }
}
