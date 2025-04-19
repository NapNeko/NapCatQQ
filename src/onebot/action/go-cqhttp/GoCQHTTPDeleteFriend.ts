import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '../type';

const SchemaData = z.object({
    friend_id: actionType.string().optional(),
    user_id: actionType.string().optional(),
    temp_block: actionType.boolean().optional(),
    temp_both_del: actionType.boolean().optional(),
});

type Payload = z.infer<typeof SchemaData>;

export class GoCQHTTPDeleteFriend extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GoCQHTTP_DeleteFriend;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const uin = payload.friend_id ?? payload.user_id ?? '';
        const uid = await this.core.apis.UserApi.getUidByUinV2(uin.toString());

        if (!uid) {
            return {
                valid: false,
                message: '好友不存在',
            };
        }
        const isBuddy = await this.core.apis.FriendApi.isBuddy(uid);
        if (!isBuddy) {
            return {
                valid: false,
                message: '不是好友',
            };
        }
        return await this.core.apis.FriendApi.delBuudy(uid, payload.temp_block, payload.temp_both_del);
    }
}
