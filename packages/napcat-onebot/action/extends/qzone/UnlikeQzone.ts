import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzoneFeedReferenceExample, QzoneFeedReferenceSchema } from './common';

export const UnlikeQzonePayloadSchema = Type.Object({ feed_ref: QzoneFeedReferenceSchema }, { additionalProperties: false });
export type UnlikeQzonePayload = Static<typeof UnlikeQzonePayloadSchema>;

export class UnlikeQzone extends OneBotAction<UnlikeQzonePayload, null> {
  override actionName = ActionName.UnlikeQzone;
  override actionSummary = '取消QQ空间说说点赞';
  override actionDescription = '传入列表或详情返回的完整 feed_ref，取消当前账号对该说说的点赞。';
  override actionTags = ['扩展接口'];
  override payloadExample = { feed_ref: QzoneFeedReferenceExample };
  override returnExample = null;
  override payloadSchema = UnlikeQzonePayloadSchema;
  override returnSchema = Type.Null();

  async _handle (payload: UnlikeQzonePayload): Promise<null> {
    await this.core.apis.QzoneApi.setLike(payload.feed_ref, false);
    return null;
  }
}
