import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneCommentPage } from '@/napcat-core/data/qzone-comments';
import { QzoneCursorSchema, QzoneFeedReferenceExample, QzoneFeedReferenceSchema } from './common';
import { QzoneCommentPageExample, QzoneCommentPageSchema, validateQzoneCommentReadPayload } from './common-comment';

export const GetQzoneCommentListPayloadSchema = Type.Object({
  feed_ref: QzoneFeedReferenceSchema,
  cursor: QzoneCursorSchema,
}, { additionalProperties: false });
export type GetQzoneCommentListPayload = Static<typeof GetQzoneCommentListPayloadSchema>;

export class GetQzoneCommentList extends OneBotAction<GetQzoneCommentListPayload, QzoneCommentPage> {
  override actionName = ActionName.GetQzoneCommentList;
  override actionSummary = '获取QQ空间说说评论';
  override actionDescription = '不传 cursor 读取详情中的首批评论，之后用返回的 feed_ref 和 next_cursor 续页。返回作者、正文、图片、赞数、内联回复及完整原始对象；未知值为 null，不自动拉取全部历史。';
  override actionTags = ['扩展接口'];
  override payloadExample = { feed_ref: QzoneFeedReferenceExample };
  override returnExample = QzoneCommentPageExample;
  override payloadSchema = GetQzoneCommentListPayloadSchema;
  override returnSchema = QzoneCommentPageSchema;

  protected override async check (payload: GetQzoneCommentListPayload): Promise<BaseCheckResult> {
    try {
      validateQzoneCommentReadPayload(payload, false);
    } catch (error) {
      return { valid: false, message: (error as Error).message };
    }
    return await super.check(payload);
  }

  async _handle (payload: GetQzoneCommentListPayload): Promise<QzoneCommentPage> {
    validateQzoneCommentReadPayload(payload, false);
    return await this.core.apis.QzoneApi.getComments(payload.feed_ref, payload.cursor);
  }
}
