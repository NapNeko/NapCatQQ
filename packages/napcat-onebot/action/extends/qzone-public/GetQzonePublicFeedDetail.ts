import { Static, Type } from '@sinclair/typebox';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction, QzonePublicFeedExample, QzonePublicFeedSchema } from './common';

const PayloadSchema = Type.Object({ feed: QzonePublicFeedSchema });
type PayloadType = Static<typeof PayloadSchema>;

export class GetQzonePublicFeedDetail extends QzonePublicAction<PayloadType> {
  override actionName = ActionName.GetQzonePublicFeedDetail;
  override actionSummary = '获取空友爱看动态详情';
  override actionDescription = '传入列表中的完整 feed 对象获取详情；继续读取评论时，将详情返回的 attach_info 作为 cursor';
  override payloadSchema = PayloadSchema;
  override payloadExample = { feed: QzonePublicFeedExample };

  async _handle (payload: PayloadType) {
    return this.core.apis.QzonePublicApi.getFeedDetail(payload.feed);
  }
}
