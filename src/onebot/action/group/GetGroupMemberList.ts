import { OB11GroupMember } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GroupMember } from '@/core';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()]))
});

type Payload = Static<typeof SchemaData>;

export class GetGroupMemberList extends OneBotAction<Payload, OB11GroupMember[]> {
    override actionName = ActionName.GetGroupMemberList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const groupIdStr = payload.group_id.toString();
        const noCache = this.parseBoolean(payload.no_cache ?? false);
        const groupMembers = await this.getGroupMembers(groupIdStr, noCache);
        const _groupMembers = await Promise.all(
            Array.from(groupMembers.values()).map(item =>
                OB11Construct.groupMember(groupIdStr, item)
            )
        );
        return Array.from(new Map(_groupMembers.map(member => [member.user_id, member])).values());
    }

    private parseBoolean(value: boolean | string): boolean {
        return typeof value === 'string' ? value === 'true' : value;
    }

    private async getGroupMembers(groupIdStr: string, noCache: boolean): Promise<Map<string, GroupMember>> {
        const memberCache = this.core.apis.GroupApi.groupMemberCache;
        let groupMembers = memberCache.get(groupIdStr);

        if (noCache || !groupMembers) {
            const data = this.core.apis.GroupApi.refreshGroupMemberCache(groupIdStr, true).then().catch();
            groupMembers = memberCache.get(groupIdStr) || (await data);
            if (!groupMembers) {
                throw new Error(`Failed to get group member list for group ${groupIdStr}`);
            }
        }

        return groupMembers;
    }
}