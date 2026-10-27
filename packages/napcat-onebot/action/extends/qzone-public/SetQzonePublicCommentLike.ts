import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import {
  parseQzonePublicEnable,
  QzonePublicAction,
  QzonePublicCommentExample,
  QzonePublicCommentSchema,
  QzonePublicEnableSchema,
  QzonePublicFeedExample,
  QzonePublicFeedSchema,
  QzonePublicReplySchema,
} from './common';

const PayloadSchema = Type.Object({
  feed: QzonePublicFeedSchema,
  comment: QzonePublicCommentSchema,
  reply: Type.Optional(QzonePublicReplySchema),
  enable: QzonePublicEnableSchema,
});
type PayloadType = Static<typeof PayloadSchema>;

export class SetQzonePublicCommentLike extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.SetQzonePublicCommentLike;
  override actionSummary = '设置空友爱看评论或回复赞';
  override actionDescription = '对完整 comment 点赞或取消点赞；传入完整 reply 时操作该回复，保留 comment/reply 的 like.id 等字段';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, comment: QzonePublicCommentExample, enable: true };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.setCommentLike(payload.feed, payload.comment, parseQzonePublicEnable(payload.enable), payload.reply);
  }
}
