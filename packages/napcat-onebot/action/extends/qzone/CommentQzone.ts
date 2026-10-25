import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneComment } from '@/napcat-core/data/qzone-rpc';
import { QzoneCommentSchema, QzoneFeedReferenceExample, QzoneFeedReferenceSchema, QzoneParentCommentSchema, QzoneUserSchema } from './common';

export const CommentQzonePayloadSchema = Type.Object({
  feed_ref: QzoneFeedReferenceSchema,
  content: Type.String({ minLength: 1, maxLength: 2000, description: '评论或回复正文' }),
  comment: Type.Optional(QzoneParentCommentSchema),
  reply_user: Type.Optional(QzoneUserSchema),
}, { additionalProperties: false });
export type CommentQzonePayload = Static<typeof CommentQzonePayloadSchema>;

const ReturnSchema = Type.Object({
  comment_id: Type.String({ description: '新评论或回复 ID' }),
  comment: QzoneCommentSchema,
});

export class CommentQzone extends OneBotAction<CommentQzonePayload, { comment_id: string; comment: QzoneComment; }> {
  override actionName = ActionName.CommentQzone;
  override actionSummary = '评论QQ空间说说';
  override actionDescription = '不传 comment 时发表评论；传入详情返回的完整父评论时回复该评论，reply_user 可指定回复目标。正文为纯文本，评论作者固定为当前账号。';
  override actionTags = ['扩展接口'];
  override payloadExample = { feed_ref: QzoneFeedReferenceExample, content: '很有意思' };
  override returnExample = {
    comment_id: 'comment-id',
    comment: { id: 'comment-id', user: { uin: '10001' }, content: [{ type: 0, content: '很有意思' }] },
  };

  override payloadSchema = CommentQzonePayloadSchema;
  override returnSchema = ReturnSchema;

  protected override async check (payload: CommentQzonePayload): Promise<BaseCheckResult> {
    const result = await super.check(payload);
    if (!result.valid) return result;
    if (!payload.content.trim()) return { valid: false, message: '评论内容不能为空' };
    if (payload.reply_user && !payload.comment) return { valid: false, message: 'reply_user 必须与完整父评论 comment 一起提供' };
    return { valid: true };
  }

  async _handle (payload: CommentQzonePayload): Promise<{ comment_id: string; comment: QzoneComment; }> {
    if (!payload.content.trim()) throw new Error('评论内容不能为空');
    if (payload.reply_user && !payload.comment) throw new Error('reply_user 必须与完整父评论 comment 一起提供');
    return await this.core.apis.QzoneApi.comment(
      payload.feed_ref,
      payload.content,
      payload.comment as QzoneComment | undefined,
      payload.reply_user
    );
  }
}
