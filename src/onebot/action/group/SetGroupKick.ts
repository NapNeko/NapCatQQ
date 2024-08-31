import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';


const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
        reject_add_request: { type: ['boolean', 'string'] },
    },
    required: ['group_id', 'user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupKick extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupKick;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const rejectReq = payload.reject_add_request?.toString() == 'true';
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('get Uid Error');
        await this.core.apis.GroupApi.kickMember(payload.group_id.toString(), [uid], rejectReq);
        return null;
    }
}
