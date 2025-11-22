import { GeneralCallResult } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  user_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
  group_id: Type.Optional(Type.Union([Type.Number(), Type.String()])),
  phone_number: Type.String({ default: '' }),
});

type Payload = Static<typeof SchemaData>;

export class SharePeerBase extends OneBotAction<Payload, GeneralCallResult & {
  arkMsg?: string;
  arkJson?: string;
}> {

  override payloadSchema = SchemaData;

  async _handle (payload: Payload) {
    if (payload.group_id) {
      return await this.core.apis.GroupApi.getGroupRecommendContactArkJson(payload.group_id.toString());
    } else if (payload.user_id) {
      return await this.core.apis.UserApi.getBuddyRecommendContactArkJson(payload.user_id.toString(), payload.phone_number);
    }
    throw new Error('group_id or user_id is required');
  }
}

const SchemaDataGroupEx = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()]),
});
export class SharePeer extends SharePeerBase {
  override actionName = ActionName.SharePeer;
}
type PayloadGroupEx = Static<typeof SchemaDataGroupEx>;

export class ShareGroupExBase extends OneBotAction<PayloadGroupEx, string> {
  override payloadSchema = SchemaDataGroupEx;

  async _handle (payload: PayloadGroupEx) {
    return await this.core.apis.GroupApi.getArkJsonGroupShare(payload.group_id.toString());
  }
}
export class ShareGroupEx extends ShareGroupExBase {
  override actionName = ActionName.ShareGroupEx;
}
export class SendGroupArkShare extends ShareGroupExBase {
  override actionName = ActionName.SendGroupArkShare;
}

export class SendArkShare extends SharePeerBase {
  override actionName = ActionName.SendArkShare;
}