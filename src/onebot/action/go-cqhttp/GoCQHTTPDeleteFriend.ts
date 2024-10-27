import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        friend_id: { type: ['string', 'number'] },
        temp_block: { type: 'boolean' },
        temp_both_del: { type: 'boolean' },
    },
    required: ['friend_id'],
} as const satisfies JSONSchema;
type Payload = FromSchema<typeof SchemaData>;

export class GoCQHTTPDeleteFriend extends BaseAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_DeleteFriend;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.friend_id.toString());

        if (!uid) {
            return {
                valid: false,
                message: '好友不存在',
            };
        }
        const isBuddy = await this.core.apis.FriendApi.isBuddy(uid);
        if (!isBuddy) {
            return {
                valid: false,
                message: '不是好友',
            };
        }
        return await this.core.apis.FriendApi.delBuudy(uid, payload.temp_block, payload.temp_both_del);
    }
}
