import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({
  feed: QzonePublicFeedSchema,
  cursor: Type.String({ minLength: 1, description: '动态详情或上一评论页返回的非空 attach_info；数字或布尔值会转为文本' }),
});
type PayloadType = Static<typeof PayloadSchema>;

export class GetQzonePublicComments extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.GetQzonePublicComments;
  override actionSummary = '获取空友爱看评论';
  override actionDescription = '读取动态的后续评论；cursor 为必填非空字符串，使用动态详情或上一评论页的 attach_info，原始评论对象应完整保留';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, cursor: 'detail-attach-info' };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.getComments(payload.feed, payload.cursor);
  }
}
