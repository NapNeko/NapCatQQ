import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class GetGroupDetailInfo extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetGroupDetailInfo;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const data = await this.core.apis.GroupApi.fetchGroupDetail(payload.group_id.toString());
        return {
            ...data,
            group_all_shut: data.shutUpAllTimestamp > 0 ? -1 : 0,
            group_remark: '',
            group_id: +payload.group_id,
            group_name: data.groupName,
            member_count: data.memberNum,
            max_member_count: data.maxMemberNum,
        };
    }
}