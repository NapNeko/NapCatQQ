import { OB11GroupMember } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()]))
});

type Payload = Static<typeof SchemaData>;

export class GetGroupMemberList extends OneBotAction<Payload, OB11GroupMember[]> {
    actionName = ActionName.GetGroupMemberList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const groupIdStr = payload.group_id.toString();
        const noCache = payload.no_cache ? this.stringToBoolean(payload.no_cache) : false;
        const memberCache = this.core.apis.GroupApi.groupMemberCache;
        let groupMembers = memberCache.get(groupIdStr);
        if (noCache || !groupMembers) {
            groupMembers = (await this.core.apis.GroupApi.getGroupMemberAll(groupIdStr)).result.infos;
            memberCache.set(groupIdStr, groupMembers);
        }
        const memberPromises = Array.from(groupMembers.values()).map(item =>
            OB11Construct.groupMember(groupIdStr, item)
        );
        const _groupMembers = await Promise.all(memberPromises);
        const MemberMap = new Map(_groupMembers.map(member => [member.user_id, member]));
        return Array.from(MemberMap.values());
    }
    stringToBoolean(str: string | boolean): boolean {
        return typeof str === 'boolean' ? str : str.toLowerCase() === "true";
    }
}
