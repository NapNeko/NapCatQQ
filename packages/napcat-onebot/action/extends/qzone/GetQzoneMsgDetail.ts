import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneDetail } from '@/napcat-core/data/qzone-rpc';
import type { SlQzoneMsgDetail } from '@/napcat-core/data/qzone-snowluma';
import { QzoneDetailReturnSchema, QzoneFeedReferenceSchema } from './common';
import { normalizeQzoneDetailPayload, SlQzoneIdentitySchema, SlQzoneIntegerSchema, SlQzoneMsgDetailExample, SlQzoneMsgDetailReturnSchema, SlQzoneUinSchema } from './common-snowluma';

export const GetQzoneMsgDetailPayloadSchema = Type.Object({
  feed_ref: Type.Optional(QzoneFeedReferenceSchema),
  tid: Type.Optional(SlQzoneIdentitySchema),
  target_uin: Type.Optional(SlQzoneUinSchema),
  pos: Type.Optional(SlQzoneIntegerSchema),
  num: Type.Optional(SlQzoneIntegerSchema),
}, { additionalProperties: Type.Unknown() });
export type GetQzoneMsgDetailPayload = Static<typeof GetQzoneMsgDetailPayloadSchema>;

export class GetQzoneMsgDetail extends OneBotAction<GetQzoneMsgDetailPayload, QzoneDetail | SlQzoneMsgDetail> {
  override actionName = ActionName.GetQzoneMsgDetail;
  override actionSummary = '获取QQ空间说说详情';
  override actionDescription = '传 tid 返回 SnowLuma 详情和评论，target_uin 默认当前账号、pos 默认0、num 默认20。传完整 feed_ref 则保留原 H5 详情、原始评论和续页信息；两种定位方式不能混用。';
  override actionTags = ['扩展接口'];
  override payloadExample = { tid: 'sample-post', pos: 0, num: 20 };
  override returnExample = SlQzoneMsgDetailExample;
  override payloadSchema = GetQzoneMsgDetailPayloadSchema;
  override returnSchema = Type.Union([SlQzoneMsgDetailReturnSchema, QzoneDetailReturnSchema]);

  protected override async check (payload: GetQzoneMsgDetailPayload): Promise<BaseCheckResult> {
    try { normalizeQzoneDetailPayload(payload); } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  async _handle (payload: GetQzoneMsgDetailPayload): Promise<QzoneDetail | SlQzoneMsgDetail> {
    const normalized = normalizeQzoneDetailPayload(payload);
    if (normalized.format === 'native') return await this.core.apis.QzoneApi.getMsgDetail(normalized.reference);
    return await this.core.apis.QzoneApi.getSnowlumaMsgDetail(normalized.tid, normalized.targetUin, normalized.pos, normalized.num);
  }
}
