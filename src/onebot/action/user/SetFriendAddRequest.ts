import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

const SchemaData = {
    type: 'object',
    properties: {
        flag: { type: 'string' },
        approve: { type: ['string', 'boolean'] },
        remark: { type: 'string' },
    },
    required: ['flag'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetFriendAddRequest extends BaseAction<Payload, null> {
    actionName = ActionName.SetFriendAddRequest;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const approve = payload.approve?.toString() !== 'false';
        await this.core.apis.FriendApi.handleFriendRequest(payload.flag, approve);
        if (payload.remark) {
            const data = payload.flag.split('|');
            if (data.length < 2) {
                throw new Error('Invalid flag');
            }
            const friendUid = data[0];
            await this.core.apis.FriendApi.setBuddyRemark(friendUid, payload.remark);
        }
        return null;
    }
}
