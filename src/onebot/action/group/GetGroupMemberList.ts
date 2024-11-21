import { OB11GroupMember } from '@/onebot';
import { OB11Entities } from '@/onebot/entities';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
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

export class GetGroupMemberList extends OneBotAction<Payload, OB11GroupMember[]> {
    actionName = ActionName.GetGroupMemberList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const groupIdStr = payload.group_id.toString();
        const noCache = payload.no_cache ? this.stringToBoolean(payload.no_cache) : false;
        const memberCache = this.core.apis.GroupApi.groupMemberCache;
        let groupMembers;
        try {
            groupMembers = await this.core.apis.GroupApi.getGroupMembersV2(groupIdStr, 3000, noCache);
        } catch (error) {
            groupMembers = memberCache.get(groupIdStr) ?? await this.core.apis.GroupApi.getGroupMembersV2(groupIdStr);
        }
        const memberPromises = Array.from(groupMembers.values()).map(item =>
            OB11Entities.groupMember(groupIdStr, item)
        );
        const _groupMembers = await Promise.all(memberPromises);
        const MemberMap = new Map(_groupMembers.map(member => [member.user_id, member]));
        return Array.from(MemberMap.values());
    }
    stringToBoolean(str: string | boolean): boolean {
        return typeof str === 'boolean' ? str : str.toLowerCase() === "true";
    }
}
