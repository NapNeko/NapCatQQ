import { GeneralCallResult } from 'napcat-core';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  user_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: 'QQ号' })),
  group_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '群号' })),
  phone_number: Type.String({ default: '', description: '手机号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '分享结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SharePeerBase extends OneBotAction<PayloadType, ReturnType> {

  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    if (payload.group_id) {
      return await this.core.apis.GroupApi.getGroupRecommendContactArkJson(payload.group_id.toString());
    } else if (payload.user_id) {
      return await this.core.apis.UserApi.getBuddyRecommendContactArkJson(payload.user_id.toString(), payload.phone_number);
    }
    throw new Error('group_id or user_id is required');
  }
}

const PayloadSchemaGroupEx = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()], { description: '群号' }),
});
export class SharePeer extends SharePeerBase {
  override actionName = ActionName.SharePeer;
}
type PayloadTypeGroupEx = Static<typeof PayloadSchemaGroupEx>;

const ReturnSchemaGroupEx = Type.String({ description: 'Ark Json内容' });

type ReturnTypeGroupEx = Static<typeof ReturnSchemaGroupEx>;

export class ShareGroupExBase extends OneBotAction<PayloadTypeGroupEx, ReturnTypeGroupEx> {
  override payloadSchema = PayloadSchemaGroupEx;
  override returnSchema = ReturnSchemaGroupEx;

  async _handle (payload: PayloadTypeGroupEx) {
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