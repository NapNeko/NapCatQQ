import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    flag: Type.String(),
    //注意强制String 非isNumeric 不遵守则不符合设计
    approve: Type.Boolean({ default: true }),
    //该字段没有语义 仅做保留 强制为True
});

type Payload = Static<typeof SchemaData>;

export class SetDoubtFriendsAddRequest extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.SetDoubtFriendsAddRequest;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.FriendApi.handleDoubtFriendRequest(payload.flag);
    }
}
