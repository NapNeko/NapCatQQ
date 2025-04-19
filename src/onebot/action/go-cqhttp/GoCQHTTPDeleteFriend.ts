import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    friend_id: Type.Optional(Type.Union([Type.String(), Type.Number()])),
    user_id: Type.Optional(Type.Union([Type.String(), Type.Number()])),
    temp_block: Type.Optional(Type.Boolean()),
    temp_both_del: Type.Optional(Type.Boolean()),
});

type Payload = Static<typeof SchemaData>;

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
