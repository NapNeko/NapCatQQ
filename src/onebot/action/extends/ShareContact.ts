import { GeneralCallResult } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    user_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    group_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
    phoneNumber: Type.String({ default: '' }),
});

type Payload = Static<typeof SchemaData>;

export class SharePeer extends OneBotAction<Payload, GeneralCallResult & {
    arkMsg?: string;
    arkJson?: string;
}> {
    override actionName = ActionName.SharePeer;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (payload.group_id) {
            return await this.core.apis.GroupApi.getGroupRecommendContactArkJson(payload.group_id.toString());
        } else if (payload.user_id) {
            return await this.core.apis.UserApi.getBuddyRecommendContactArkJson(payload.user_id.toString(), payload.phoneNumber);
        }
        throw new Error('group_id or user_id is required');
    }
}

const SchemaDataGroupEx = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
});

type PayloadGroupEx = Static<typeof SchemaDataGroupEx>;

export class ShareGroupEx extends OneBotAction<PayloadGroupEx, string> {
    override actionName = ActionName.ShareGroupEx;
    override payloadSchema = SchemaDataGroupEx;

    async _handle(payload: PayloadGroupEx) {
        return await this.core.apis.GroupApi.getArkJsonGroupShare(payload.group_id.toString());
    }
}
