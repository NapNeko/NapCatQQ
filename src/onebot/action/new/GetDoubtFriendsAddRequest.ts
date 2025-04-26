import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    count: Type.Number({ default: 50 }),
});

type Payload = Static<typeof SchemaData>;

export class GetDoubtFriendsAddRequest extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetDoubtFriendsAddRequest;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.FriendApi.getDoubtFriendRequest(payload.count);
    }
}
