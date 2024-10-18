import { OB11GroupMember } from '@/onebot';
import { OB11Entities } from '@/onebot/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        no_cache: { type: ['boolean', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupMemberList extends BaseAction<Payload, OB11GroupMember[]> {
    actionName = ActionName.GetGroupMemberList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const groupIdStr = payload.group_id.toString();
        const groupMembers = await this.core.apis.GroupApi.getGroupMembersV2(groupIdStr);

        const memberPromises = Array.from(groupMembers.values()).map(item =>
            OB11Entities.groupMember(groupIdStr, item)
        );
        const _groupMembers = await Promise.all(memberPromises);
        const MemberMap = new Map(_groupMembers.map(member => [member.user_id, member]));
        return Array.from(MemberMap.values());
    }
}