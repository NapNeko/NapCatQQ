import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        user_id: { type: ['number', 'string'] },
        card: { type: 'string' },
    },
    required: ['group_id', 'user_id', 'card'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupCard extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupCard;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const member = await this.core.apis.GroupApi.getGroupMember(payload.group_id.toString(), payload.user_id.toString());
        if (member) await this.core.apis.GroupApi.setMemberCard(payload.group_id.toString(), member.uid, payload.card || '');
        return null;
    }
}
