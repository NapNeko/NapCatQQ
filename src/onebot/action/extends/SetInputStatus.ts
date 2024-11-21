import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { ChatType } from '@/core';

const SchemaData = {
    type: 'object',
    properties: {
        event_type: { type: 'number' },
        user_id: { type: ['number', 'string'] },
    },
    required: ['event_type', 'user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetInputStatus extends OneBotAction<Payload, any> {
    actionName = ActionName.SetInputStatus;

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
