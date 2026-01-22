import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType, Peer } from 'napcat-core/types';

const SchemaData = Type.Object({
  fileset_id: Type.String(),
  user_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
  group_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export class SendFlashMsg extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.SendFlashMsg;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    let peer: Peer;

    if (payload.group_id) {
      peer = { chatType: ChatType.KCHATTYPEGROUP, peerUid: payload.group_id.toString() };
    } else if (payload.user_id) {
      const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
      if (!uid) throw new Error('User not found');

      // 可能需要更严格的判断
      const isBuddy = await this.core.apis.FriendApi.isBuddy(uid);
      peer = {
        chatType: isBuddy ? ChatType.KCHATTYPEC2C : ChatType.KCHATTYPETEMPC2CFROMGROUP,
        peerUid: uid,
      };
    } else {
      throw new Error('user_id or group_id is required');
    }

    return await this.core.apis.FlashApi.sendFlashMessage(payload.fileset_id, peer);
  }
}
