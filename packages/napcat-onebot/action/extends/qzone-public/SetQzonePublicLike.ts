import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { parseQzonePublicEnable, QzonePublicAction, QzonePublicEnableSchema, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema, enable: QzonePublicEnableSchema });
type PayloadType = Static<typeof PayloadSchema>;

export class SetQzonePublicLike extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.SetQzonePublicLike;
  override actionSummary = '设置空友爱看普通赞';
  override actionDescription = '对完整 feed 设置或取消普通点赞（like）；enable 默认 true，此操作与推分别处理';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, enable: true };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.setLike(payload.feed, parseQzonePublicEnable(payload.enable));
  }
}
