import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '../type';
const SchemaData = z.object({
    group_id: actionType.string(),
    notice_id: actionType.string()
});

type Payload = z.infer<typeof SchemaData>;

export class DelGroupNotice extends OneBotAction<Payload, void> {
    override actionName = ActionName.DelGroupNotice;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const group = payload.group_id.toString();
        const noticeId = payload.notice_id;
        return await this.core.apis.GroupApi.deleteGroupBulletin(group, noticeId);
    }
}
