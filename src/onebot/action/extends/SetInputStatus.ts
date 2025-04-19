import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ChatType } from '@/core';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Union([Type.Number(), Type.String()]),
    event_type: Type.Number(),
});

type Payload = Static<typeof SchemaData>;

export class SetInputStatus extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.SetInputStatus;
    override payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('uid is empty');
        const peer = {
            chatType: ChatType.KCHATTYPEC2C,
            peerUid: uid,
        };
        return await this.core.apis.MsgApi.sendShowInputStatusReq(peer, payload.event_type);
    }
}
