import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneComment } from '@/napcat-core/data/qzone-rpc';
import type { QzoneReplyPage } from '@/napcat-core/data/qzone-comments';
import { QzoneCursorSchema, QzoneFeedReferenceExample, QzoneFeedReferenceSchema } from './common';
import { QzoneReadParentCommentExample, QzoneReadParentCommentSchema, QzoneReplyPageExample, QzoneReplyPageSchema, validateQzoneCommentReadPayload } from './common-comment';

export const GetQzoneCommentRepliesPayloadSchema = Type.Object({
  feed_ref: QzoneFeedReferenceSchema,
  comment: QzoneReadParentCommentSchema,
  cursor: QzoneCursorSchema,
}, { additionalProperties: false });
export type GetQzoneCommentRepliesPayload = Static<typeof GetQzoneCommentRepliesPayloadSchema>;

export class GetQzoneCommentReplies extends OneBotAction<GetQzoneCommentRepliesPayload, QzoneReplyPage> {
  override actionName = ActionName.GetQzoneCommentReplies;
  override actionSummary = '获取QQ空间评论楼中楼回复';
  override actionDescription = '传入读取结果的完整 comment，使用其回复游标读取追加回复；之后用返回的 feed_ref、同一父评论和 next_cursor 续页。与内联回复按 ID 合并，不自动拉取全部历史；每页使用空间固定页大小。';
  override actionTags = ['扩展接口'];
  override payloadExample = { feed_ref: QzoneFeedReferenceExample, comment: QzoneReadParentCommentExample };
  override returnExample = QzoneReplyPageExample;
  override payloadSchema = GetQzoneCommentRepliesPayloadSchema;
  override returnSchema = QzoneReplyPageSchema;

  protected override async check (payload: GetQzoneCommentRepliesPayload): Promise<BaseCheckResult> {
    try {
      validateQzoneCommentReadPayload(payload, true);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return await super.check(payload);
  }

  async _handle (payload: GetQzoneCommentRepliesPayload): Promise<QzoneReplyPage> {
    validateQzoneCommentReadPayload(payload, true);
    return await this.core.apis.QzoneApi.getCommentReplies(payload.feed_ref, payload.comment as QzoneComment, payload.cursor);
  }
}
