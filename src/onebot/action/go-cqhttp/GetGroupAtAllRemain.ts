import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()])
});

type Payload = Static<typeof SchemaData>;

export class GoCQHTTPGetGroupAtAllRemain extends OneBotAction<Payload, any> {
    actionName = ActionName.GoCQHTTP_GetGroupAtAllRemain;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.GroupApi.getGroupRemainAtTimes(payload.group_id.toString());
        const data = {
            can_at_all: ret.atInfo.canAtAll,
            remain_at_all_count_for_group: ret.atInfo.RemainAtAllCountForGroup,
            remain_at_all_count_for_uin: ret.atInfo.RemainAtAllCountForUin
        };
        return data;
    }
}
