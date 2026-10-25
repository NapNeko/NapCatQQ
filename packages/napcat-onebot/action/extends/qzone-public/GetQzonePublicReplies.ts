import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import {
  parseQzonePublicPageSize,
  QzonePublicAction,
  QzonePublicCommentExample,
  QzonePublicCommentSchema,
  QzonePublicFeedExample,
  QzonePublicFeedSchema,
} from './common';

const PayloadSchema = Type.Object({
  feed: QzonePublicFeedSchema,
  comment: QzonePublicCommentSchema,
  cursor: Type.Optional(Type.String({ default: '', description: '回复分页游标，默认为空字符串；空字符串时使用 comment.reply_attach_info；数字或布尔值会转为文本' })),
  page_size: Type.Optional(Type.Union([
    Type.Number({ minimum: 1 }), Type.String(),
  ], { default: 20, description: '每页回复数量，默认 20；有限数字或非空数值字符串，向零截断后应大于等于 1' })),
});
type PayloadType = Static<typeof PayloadSchema>;

export class GetQzonePublicReplies extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.GetQzonePublicReplies;
  override actionSummary = '获取空友爱看评论回复';
  override actionDescription = '传入完整动态及父评论读取回复分页；省略 cursor 时使用父评论中的 reply_attach_info';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, comment: QzonePublicCommentExample, page_size: 20 };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.getReplies(payload.feed, payload.comment, payload.cursor ?? '', parseQzonePublicPageSize(payload.page_size));
  }
}
