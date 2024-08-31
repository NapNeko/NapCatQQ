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
        return null;
    }
}
