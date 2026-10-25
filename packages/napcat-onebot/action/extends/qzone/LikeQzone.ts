import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzoneFeedReferenceExample, QzoneFeedReferenceSchema } from './common';

export const LikeQzonePayloadSchema = Type.Object({ feed_ref: QzoneFeedReferenceSchema }, { additionalProperties: false });
export type LikeQzonePayload = Static<typeof LikeQzonePayloadSchema>;

export class LikeQzone extends OneBotAction<LikeQzonePayload, null> {
  override actionName = ActionName.LikeQzone;
  override actionSummary = '点赞QQ空间说说';
  override actionDescription = '传入列表或详情返回的完整 feed_ref，包含点赞所需的 like_key。';
  override actionTags = ['扩展接口'];
  override payloadExample = { feed_ref: QzoneFeedReferenceExample };
  override returnExample = null;
  override payloadSchema = LikeQzonePayloadSchema;
  override returnSchema = Type.Null();

  async _handle (payload: LikeQzonePayload): Promise<null> {
    await this.core.apis.QzoneApi.setLike(payload.feed_ref, true);
    return null;
  }
}
