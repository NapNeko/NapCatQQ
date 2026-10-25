import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction, QzonePublicContentSchema, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema, content: QzonePublicContentSchema });
type PayloadType = Static<typeof PayloadSchema>;

export class CommentQzonePublicFeed extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.CommentQzonePublicFeed;
  override actionSummary = '评论空友爱看动态';
  override actionDescription = '对完整 feed 发表评论；content 接受非空文本或富文本对象数组，富文本字段原样保留';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, content: '很有意思' };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.addComment(payload.feed, payload.content);
  }
}
