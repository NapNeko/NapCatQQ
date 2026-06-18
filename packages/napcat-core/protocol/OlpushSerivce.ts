import { NapProtoMsg } from 'napcat-protobuf';
import { ReceiveService, ServiceBase } from '../packet/handler/serviceRegister';
import { GroupReactNotify, PushMsg } from '../packet/transformer/proto';

@ReceiveService('trpc.msg.olpush.OlPushService.MsgPush')
export class OlPushService extends ServiceBase {
  async handler (_seq: number, hex_data: string) {
    const data = new NapProtoMsg(PushMsg).decode(Buffer.from(hex_data, 'hex'));
    if (data.message.contentHead.type === 732 && data.message.contentHead.subType === 16) {
      const pbNotify = data.message.body?.msgContent?.slice(7);
      if (!pbNotify) {
        return;
      }
      // 开始解析Notify
      const notify = new NapProtoMsg(GroupReactNotify).decode(pbNotify);
      if ((notify.field13 ?? 0) === 35) {
        // Group React Notify
        const groupCode = notify.groupUin?.toString() ?? '';
        const operatorUid = notify.groupReactionData?.data?.data?.groupReactionDataContent?.operatorUid ?? '';
        const type = notify.groupReactionData?.data?.data?.groupReactionDataContent?.type ?? 0;
        const seq = notify.groupReactionData?.data?.data?.groupReactionTarget?.seq?.toString() ?? '';
        const code = notify.groupReactionData?.data?.data?.groupReactionDataContent?.code ?? '';
        const count = notify.groupReactionData?.data?.data?.groupReactionDataContent?.count ?? 0;
        const senderUin = await this.core.apis.UserApi.getUinByUidV2(operatorUid);
        this.event.emit('event:emoji_like', {
          groupId: groupCode,
          senderUin,
          emojiId: code,
          msgSeq: seq,
          isAdd: type === 1,
          count,
        });
      }
    }
  }
}
