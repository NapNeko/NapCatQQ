import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ChatType } from 'napcat-core/types';

const SchemaData = Type.Object({
  user_id: Type.Union([Type.Number(), Type.String()]),
  folder_path: Type.String(),
  folder_name: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class SendOnlineFolder extends OneBotAction<Payload, unknown> {
  override actionName = ActionName.SendOnlineFolder;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');

    const peer = { chatType: ChatType.KCHATTYPEC2C, peerUid: uid };

    return await this.core.apis.OnlineApi.sendOnlineFolder(peer, payload.folder_path, payload.folder_name);
  }
}
