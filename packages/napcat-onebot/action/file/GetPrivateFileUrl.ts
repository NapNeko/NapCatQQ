import { ActionName } from '@/napcat-onebot/action/router';
import { FileNapCatOneBotUUID } from 'napcat-common/src/file-uuid';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

const PayloadSchema = Type.Object({
  file_id: Type.String({ description: '文件ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  url: Type.Optional(Type.String({ description: '文件下载链接' })),
}, { description: '私聊文件URL信息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetPrivateFileUrl extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.NapCat_GetPrivateFileUrl;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '获取私聊文件URL';
  override actionTags = ['文件接口'];
  override payloadExample = ActionExamples.GetPrivateFileUrl.payload;
  override returnExample = ActionExamples.GetPrivateFileUrl.return;

  async _handle (payload: PayloadType) {
    const contextMsgFile = FileNapCatOneBotUUID.decode(payload.file_id);

    if (contextMsgFile?.fileUUID && contextMsgFile.msgId) {
      const msg = await this.core.apis.MsgApi.getMsgsByMsgId(contextMsgFile.peer, [contextMsgFile.msgId]);
      const self_id = this.core.selfInfo.uid;
      const file_hash = msg.msgList[0]?.elements.map(ele => ele.fileElement?.file10MMd5)[0];
      if (file_hash) {
        return {
          url: await this.core.apis.PacketApi.pkt.operation.GetPrivateFileUrl(self_id, contextMsgFile.fileUUID, file_hash),
        };
      }
    }
    throw new Error('real fileUUID not found!');
  }
}
