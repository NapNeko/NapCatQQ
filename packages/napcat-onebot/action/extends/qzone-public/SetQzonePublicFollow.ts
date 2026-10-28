import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { parseQzonePublicEnable, QzonePublicAction, QzonePublicEnableSchema, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema, enable: QzonePublicEnableSchema });
type PayloadType = Static<typeof PayloadSchema>;

export class SetQzonePublicFollow extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.SetQzonePublicFollow;
  override actionSummary = '蹲或取消蹲空友爱看作者';
  override actionDescription = '根据完整 feed 蹲或取消蹲动态作者；enable 默认 true，返回上游操作结果';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample, enable: true };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.setFollow(payload.feed, parseQzonePublicEnable(payload.enable));
  }
}
