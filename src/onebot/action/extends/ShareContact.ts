import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    group_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    phoneNumber: Type.String({ default: '' }),
});

type Payload = Static<typeof SchemaData>;

export class SharePeer extends OneBotAction<Payload, any> {
    actionName = ActionName.SharePeer;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (payload.group_id) {
            return await this.core.apis.GroupApi.getGroupRecommendContactArkJson(payload.group_id.toString());
        } else if (payload.user_id) {
            return await this.core.apis.UserApi.getBuddyRecommendContactArkJson(payload.user_id.toString(), payload.phoneNumber);
        }
    }
}

const SchemaDataGroupEx = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
});

type PayloadGroupEx = Static<typeof SchemaDataGroupEx>;

export class ShareGroupEx extends OneBotAction<PayloadGroupEx, any> {
    actionName = ActionName.ShareGroupEx;
    payloadSchema = SchemaDataGroupEx;

    async _handle(payload: PayloadGroupEx) {
        return await this.core.apis.GroupApi.getArkJsonGroupShare(payload.group_id.toString());
    }
}
