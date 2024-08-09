import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi } from '@/core/apis/friend';

const SchemaData = {
    type: 'object',
    properties: {
        flag: { type: 'string' },
        approve: { type: ['string', 'boolean'] },
        remark: { type: 'string' }
    },
    required: ['flag']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetFriendAddRequest extends BaseAction<Payload, null> {
    actionName = ActionName.SetFriendAddRequest;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload): Promise<null> {
        const NTQQFriendApi = this.CoreContext.getApiContext().FriendApi;
        const approve = payload.approve?.toString() !== 'false';
        await NTQQFriendApi.handleFriendRequest(payload.flag, approve);
        return null;
    }
}
