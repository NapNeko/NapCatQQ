import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import {
  QzonePublicAction,
  QzonePublicCommentExample,
  QzonePublicCommentSchema,
  QzonePublicFeedExample,
  QzonePublicFeedSchema,
  QzonePublicReplyExample,
  QzonePublicReplySchema,
} from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema, comment: QzonePublicCommentSchema, reply: QzonePublicReplySchema });
type PayloadType = Static<typeof PayloadSchema>;

export class DeleteQzonePublicReply extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.DeleteQzonePublicReply;
  override actionSummary = '删除空友爱看回复';
  override actionDescription = '传入完整 feed、父 comment 和目标 reply 删除回复，操作权限由上游校验';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, comment: QzonePublicCommentExample, reply: QzonePublicReplyExample };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.deleteReply(payload.feed, payload.comment, payload.reply);
  }
}
