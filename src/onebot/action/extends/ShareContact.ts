import { GeneralCallResult } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '@/common/coerce';
const SchemaData = z.object({
    user_id: actionType.string().optional(),
    group_id: actionType.string().optional(),
    phoneNumber: actionType.string().default(''),
});

type Payload = z.infer<typeof SchemaData>;

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

const SchemaDataGroupEx = z.object({
    group_id: actionType.string(),
});

type PayloadGroupEx = z.infer<typeof SchemaDataGroupEx>;

export class ShareGroupEx extends OneBotAction<PayloadGroupEx, string> {
    override actionName = ActionName.ShareGroupEx;
    override payloadSchema = SchemaDataGroupEx;

    async _handle(payload: PayloadGroupEx) {
        return await this.core.apis.GroupApi.getArkJsonGroupShare(payload.group_id.toString());
    }
}
