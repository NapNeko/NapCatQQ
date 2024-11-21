import { OB11Group } from '@/onebot';
import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupInfo extends OneBotAction<Payload, OB11Group> {
    actionName = ActionName.GetGroupInfo;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const group = (await this.core.apis.GroupApi.getGroups()).find(e => e.groupCode == payload.group_id.toString());
        if (!group) {
            const data = await this.core.apis.GroupApi.searchGroup(payload.group_id.toString());
            if (!data) throw new Error('Group not found');
            return {
                ...data.searchGroupInfo,
                group_id: +payload.group_id,
                group_name: data.searchGroupInfo.groupName,
                member_count: data.searchGroupInfo.memberNum,
                max_member_count: data.searchGroupInfo.maxMemberNum,
            };
        }
        return OB11Construct.group(group);
    }
}

export default GetGroupInfo;
