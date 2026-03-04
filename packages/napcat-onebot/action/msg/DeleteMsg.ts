import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()], { description: '消息ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

class DeleteMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.DeleteMsg;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '撤回消息';
  override actionDescription = '撤回已发送的消息';
  override actionTags = ['消息接口'];
  override payloadExample = {
    message_id: 12345
  };
  override returnExample = null;

  async _handle (payload: PayloadType) {
    const msg = MessageUnique.getMsgIdAndPeerByShortId(Number(payload.message_id));
    if (msg) {
      this.obContext.recallEventCache.set(msg.MsgId, setTimeout(() => {
        this.obContext.recallEventCache.delete(msg.MsgId);
      }, 5000));
      await this.core.apis.MsgApi.recallMsg(msg.Peer, msg.MsgId);
      return null;
    } else {
      throw new Error('Recall failed');
    }
  }
}

export default DeleteMsg;
