import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.number(), z.string()]),
    notice_id: z.string()
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
