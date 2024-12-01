import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class FetchUserProfileLike extends OneBotAction<Payload, any> {
    actionName = ActionName.FetchUserProfileLike;

    async _handle(payload: Payload) {
        return await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    }
}
