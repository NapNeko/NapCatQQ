import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction, QzonePublicCommentExample, QzonePublicCommentSchema, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema, comment: QzonePublicCommentSchema });
type PayloadType = Static<typeof PayloadSchema>;

export class DeleteQzonePublicComment extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.DeleteQzonePublicComment;
  override actionSummary = '删除空友爱看评论';
  override actionDescription = '传入完整 feed 及 comment 删除评论，操作权限由上游校验';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, comment: QzonePublicCommentExample };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.deleteComment(payload.feed, payload.comment);
  }
}
