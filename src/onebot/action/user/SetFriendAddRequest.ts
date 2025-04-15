import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    flag: z.union([z.coerce.string(), z.coerce.number()]),
    approve: z.union([z.coerce.string(), z.coerce.boolean()]).default(true),
    remark: z.union([z.coerce.string(), z.null()]).nullable().optional()
});

type Payload = z.infer<typeof SchemaData>;

export default class SetFriendAddRequest extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetFriendAddRequest;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const approve = payload.approve?.toString() !== 'false';
        const notify = (await this.core.apis.FriendApi.getBuddyReq()).buddyReqs.find(e => e.reqTime == payload.flag.toString());
        if (!notify) {
            throw new Error('No such request');
        }
        await this.core.apis.FriendApi.handleFriendRequest(notify, approve);
        if (payload.remark) {
            await this.core.apis.FriendApi.setBuddyRemark(notify.friendUid, payload.remark);
        }
        return null;
    }
}
