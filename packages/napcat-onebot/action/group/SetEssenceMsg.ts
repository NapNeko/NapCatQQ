import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  message_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export default class SetEssenceMsg extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.SetEssenceMsg;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
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
