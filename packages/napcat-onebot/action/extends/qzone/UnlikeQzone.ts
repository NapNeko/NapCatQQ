import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import { QzoneFeedReferenceSchema } from './common';
import { normalizeQzoneLikePayload, SlQzoneIdentitySchema, SlQzoneIntegerSchema, SlQzoneUinSchema } from './common-snowluma';

export const UnlikeQzonePayloadSchema = Type.Object({
  feed_ref: Type.Optional(QzoneFeedReferenceSchema),
  tid: Type.Optional(SlQzoneIdentitySchema),
  target_uin: Type.Optional(SlQzoneUinSchema),
  abstime: Type.Optional(SlQzoneIntegerSchema),
}, { additionalProperties: Type.Unknown() });
export type UnlikeQzonePayload = Static<typeof UnlikeQzonePayloadSchema>;

export class UnlikeQzone extends OneBotAction<UnlikeQzonePayload, null> {
  override actionName = ActionName.UnlikeQzone;
  override actionSummary = '取消QQ空间说说点赞';
  override actionDescription = '支持 SnowLuma 的 tid、target_uin 和 abstime（默认0）；传 feed_ref 则沿用原 H5 取消点赞方式。两种定位方式不能混用，写入失败不会切换接口重试。';
  override actionTags = ['扩展接口'];
  override payloadExample = { tid: 'sample-post', target_uin: '10002', abstime: 1700000000 };
  override returnExample = null;
  override payloadSchema = UnlikeQzonePayloadSchema;
  override returnSchema = Type.Null();

  protected override async check (payload: UnlikeQzonePayload): Promise<BaseCheckResult> {
    try { normalizeQzoneLikePayload(payload); } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  async _handle (payload: UnlikeQzonePayload): Promise<null> {
    const normalized = normalizeQzoneLikePayload(payload);
    if (normalized.format === 'native') await this.core.apis.QzoneApi.setLike(normalized.reference, false);
    else await this.core.apis.QzoneApi.setSnowlumaLike(normalized.tid, normalized.targetUin, false, normalized.abstime);
    return null;
  }
}
