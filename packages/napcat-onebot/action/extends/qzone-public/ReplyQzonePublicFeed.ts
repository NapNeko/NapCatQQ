import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import {
  QzonePublicAction,
  QzonePublicCommentExample,
  QzonePublicCommentSchema,
  QzonePublicContentSchema,
  QzonePublicFeedExample,
  QzonePublicFeedSchema,
  QzonePublicReplySchema,
} from './common';

const PayloadSchema = Type.Object({
  feed: QzonePublicFeedSchema,
  comment: QzonePublicCommentSchema,
  content: QzonePublicContentSchema,
  reply: Type.Optional(QzonePublicReplySchema),
});
type PayloadType = Static<typeof PayloadSchema>;

export class ReplyQzonePublicFeed extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.ReplyQzonePublicFeed;
  override actionSummary = '回复空友爱看评论';
  override actionDescription = '传入完整 feed、父 comment 及非空 content 发表回复；需要回复已有回复时一并传入完整 reply';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, comment: QzonePublicCommentExample, content: '谢谢分享' };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.addReply(payload.feed, payload.comment, payload.content, payload.reply);
  }
}
