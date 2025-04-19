import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '../type';

const SchemaData = z.object({
    group_id: actionType.string(),
    user_id: actionType.string(),
    reject_add_request: actionType.boolean().optional(),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupKick extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupKick;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const rejectReq = payload.reject_add_request?.toString() == 'true';
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('get Uid Error');
        await this.core.apis.GroupApi.kickMember(payload.group_id.toString(), [uid], rejectReq);
        return null;
    }
}
