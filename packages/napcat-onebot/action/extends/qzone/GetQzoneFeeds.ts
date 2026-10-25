import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import type { QzoneFeedPage } from '@/napcat-core/data/qzone-rpc';
import { QzoneCursorSchema, QzoneFeedItemExample, QzoneFeedsReturnSchema } from './common';

export const GetQzoneFeedsPayloadSchema = Type.Object({ cursor: QzoneCursorSchema }, { additionalProperties: false });
export type GetQzoneFeedsPayload = Static<typeof GetQzoneFeedsPayloadSchema>;

export class GetQzoneFeeds extends OneBotAction<GetQzoneFeedsPayload, QzoneFeedPage> {
  override actionName = ActionName.GetQzoneFeeds;
  override actionSummary = '获取QQ空间好友动态';
  override actionDescription = '不传 cursor 读取第一页；后续传回 next_cursor。按空间实际页大小返回，不支持 page_num/count。feed_ref 可用于详情、点赞和评论。';
  override actionTags = ['扩展接口'];
  override payloadExample = {};
  override returnExample = { feeds: [QzoneFeedItemExample], has_more: false, next_cursor: null };
  override payloadSchema = GetQzoneFeedsPayloadSchema;
  override returnSchema = QzoneFeedsReturnSchema;

  async _handle (payload: GetQzoneFeedsPayload): Promise<QzoneFeedPage> {
    return await this.core.apis.QzoneApi.getFriendFeeds(payload.cursor);
  }
}
