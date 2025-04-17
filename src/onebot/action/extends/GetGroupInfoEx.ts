import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '@/common/coerce';
const SchemaData = z.object({
    group_id:  actionType.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class GetGroupInfoEx extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetGroupInfoEx;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return (await this.core.apis.GroupApi.getGroupExtFE0Info([payload.group_id])).result.groupExtInfos.get(payload.group_id);
    }
}
