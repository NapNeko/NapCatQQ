import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneFeedPage } from '@/napcat-core/data/qzone-rpc';
import type { SlQzoneFeedPage } from '@/napcat-core/data/qzone-snowluma-feeds';
import { QzoneFeedsReturnSchema } from './common';
import { normalizeQzoneFeedsPayload, QzoneFormatSchema, SlQzoneCursorSchema, SlQzoneFeedsExample, SlQzoneFeedsReturnSchema, SlQzoneIntegerSchema } from './common-snowluma';

export const GetQzoneFeedsPayloadSchema = Type.Object({
  format: QzoneFormatSchema,
  page_num: Type.Optional(SlQzoneIntegerSchema),
  count: Type.Optional(SlQzoneIntegerSchema),
  cursor: SlQzoneCursorSchema,
}, { additionalProperties: Type.Unknown() });
export type GetQzoneFeedsPayload = Static<typeof GetQzoneFeedsPayloadSchema>;

export class GetQzoneFeeds extends OneBotAction<GetQzoneFeedsPayload, QzoneFeedPage | SlQzoneFeedPage> {
  override actionName = ActionName.GetQzoneFeeds;
  override actionSummary = '获取QQ空间好友动态';
  override actionDescription = '默认返回 SnowLuma 格式，page_num 默认1、count 默认10，续页原样传 cursor。format=native 返回原 H5 Feed 和 feed_ref；旧 native 游标可自动识别，native 模式不接受 page_num/count。';
  override actionTags = ['扩展接口'];
  override payloadExample = { page_num: 1, count: 10 };
  override returnExample = SlQzoneFeedsExample;
  override payloadSchema = GetQzoneFeedsPayloadSchema;
  override returnSchema = Type.Union([SlQzoneFeedsReturnSchema, QzoneFeedsReturnSchema]);

  protected override async check (payload: GetQzoneFeedsPayload): Promise<BaseCheckResult> {
    try { normalizeQzoneFeedsPayload(payload); } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  async _handle (payload: GetQzoneFeedsPayload): Promise<QzoneFeedPage | SlQzoneFeedPage> {
    const normalized = normalizeQzoneFeedsPayload(payload);
    if (normalized.format === 'native') return await this.core.apis.QzoneApi.getFriendFeeds(normalized.cursor);
    return await this.core.apis.QzoneApi.getSnowlumaFeeds(normalized.pageNum, normalized.count, normalized.cursor);
  }
}
