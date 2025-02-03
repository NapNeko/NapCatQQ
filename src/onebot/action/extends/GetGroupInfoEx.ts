import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Type, Static } from '@sinclair/typebox';
const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class GetGroupInfoEx extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetGroupInfoEx;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.getGroupExtFE0Info([payload.group_id.toString()])).result.groupExtInfos.get(payload.group_id.toString());
    }
}
