import { ActionName } from '@/napcat-onebot/action/router';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

import { FileActionsExamples } from '../example/FileActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  file_id: Type.String({ description: '文件ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  url: Type.Optional(Type.String({ description: '文件下载链接' })),
}, { description: '群文件URL信息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupFileUrl extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.GOCQHTTP_GetGroupFileUrl;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群文件URL';
  override actionDescription = '获取指定群文件的下载链接';
  override actionTags = ['文件接口'];
  override payloadExample = FileActionsExamples.GetGroupFileUrl.payload;
  override returnExample = FileActionsExamples.GetGroupFileUrl.response;

  async _handle (payload: PayloadType) {
    const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id) || FileNapCatOneBotUUID.decodeModelId(payload.file_id);
    if (contextMsgFile?.fileUUID) {
      return {
        url: await this.core.apis.PacketApi.pkt.operation.GetGroupFileUrl(+payload.group_id, contextMsgFile.fileUUID),
      };
    }
    throw new Error('real fileUUID not found!');
  }
}
