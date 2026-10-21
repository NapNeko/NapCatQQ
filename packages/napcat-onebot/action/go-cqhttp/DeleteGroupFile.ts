import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { Static, Type } from '@sinclair/typebox';
import { GoCQHTTPActionsExamples } from '../example/GoCQHTTPActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  file_id: Type.String({ description: '文件ID' }),
  bus_id: Type.Optional(Type.Number({ minimum: 1, maximum: 0xFFFFFFFF, multipleOf: 1, description: '文件业务ID，默认使用文件列表中的 busid' })),
  busid: Type.Optional(Type.Number({ minimum: 1, maximum: 0xFFFFFFFF, multipleOf: 1, description: '文件业务ID，兼容 busid 字段' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '删除结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class DeleteGroupFile extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GOCQHTTP_DeleteGroupFile;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '删除群文件';
  override actionDescription = '在群文件系统中删除指定的文件';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = GoCQHTTPActionsExamples.DeleteGroupFile.payload;
  override returnExample = GoCQHTTPActionsExamples.DeleteGroupFile.response;

  async _handle (payload: PayloadType) {
    const data = FileNapCatOneBotUUID.decodeModelId(payload.file_id);
    if (!data || !data.fileId) throw new Error('Invalid file_id');
    const groupCode = payload.group_id.toString();
    if (data.peer.chatType !== 2 || data.peer.peerUid !== groupCode) {
      throw new Error('file_id 不属于指定群');
    }
    if (payload.bus_id !== undefined && payload.busid !== undefined && payload.bus_id !== payload.busid) {
      throw new Error('bus_id 与 busid 不一致');
    }
    const busId = payload.bus_id ?? payload.busid ?? data.busId;
    return await this.core.apis.GroupApi.delGroupFile(groupCode, [data.fileId], busId === undefined ? undefined : [busId]);
  }
}
