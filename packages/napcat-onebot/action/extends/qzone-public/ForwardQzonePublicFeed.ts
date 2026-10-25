import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({
  feed: QzonePublicFeedSchema,
  reason: Type.Optional(Type.String({ default: '', description: '转发附言，默认空字符串；数字或布尔值会转为文本' })),
});
type PayloadType = Static<typeof PayloadSchema>;

export class ForwardQzonePublicFeed extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.ForwardQzonePublicFeed;
  override actionSummary = '转发空友爱看动态';
  override actionDescription = '将完整 feed 转发到自己的空间，可通过 reason 添加转发附言';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, reason: '分享一条动态' };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.forwardFeed(payload.feed, payload.reason ?? '');
  }
}
