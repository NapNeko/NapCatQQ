import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

const PayloadSchema = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()], { description: '消息ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetEssenceMsg extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetEssenceMsg;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '设置精华消息';
  override actionTags = ['群组接口'];
  override payloadExample = ActionExamples.SetEssenceMsg.payload;

  async _handle (payload: PayloadType) {
    const msg = MessageUnique.getMsgIdAndPeerByShortId(+payload.message_id);
    if (!msg) {
      throw new Error('msg not found');
    }
    return await this.core.apis.GroupApi.addGroupEssence(
      msg.Peer.peerUid,
      msg.MsgId
    );
  }
}
