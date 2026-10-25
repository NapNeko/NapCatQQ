import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { parseQzonePublicEnable, QzonePublicAction, QzonePublicEnableSchema, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema, enable: QzonePublicEnableSchema });
type PayloadType = Static<typeof PayloadSchema>;

export class SetQzonePublicUpvote extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.SetQzonePublicUpvote;
  override actionSummary = '推或取消推空友爱看动态';
  override actionDescription = '对完整 feed 设置推或取消推（upvote）；enable 默认 true，此操作与普通点赞分别处理';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, enable: true };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.setUpvote(payload.feed, parseQzonePublicEnable(payload.enable));
  }
}
