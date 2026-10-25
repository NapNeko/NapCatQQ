import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import type { QzoneDetail } from '@/napcat-core/data/qzone-rpc';
import { QzoneDetailReturnSchema, QzoneFeedItemExample, QzoneFeedReferenceExample, QzoneFeedReferenceSchema } from './common';

export const GetQzoneMsgDetailPayloadSchema = Type.Object({ feed_ref: QzoneFeedReferenceSchema }, { additionalProperties: false });
export type GetQzoneMsgDetailPayload = Static<typeof GetQzoneMsgDetailPayloadSchema>;

export class GetQzoneMsgDetail extends OneBotAction<GetQzoneMsgDetailPayload, QzoneDetail> {
  override actionName = ActionName.GetQzoneMsgDetail;
  override actionSummary = '获取QQ空间说说详情';
  override actionDescription = '传入列表返回的完整 feed_ref。tid 不能代替空间动态身份；comments 保留原始评论对象，可用于回复。';
  override actionTags = ['扩展接口'];
  override payloadExample = { feed_ref: QzoneFeedReferenceExample };
  override returnExample = { ...QzoneFeedItemExample, comments: [] };
  override payloadSchema = GetQzoneMsgDetailPayloadSchema;
  override returnSchema = QzoneDetailReturnSchema;

  async _handle (payload: GetQzoneMsgDetailPayload): Promise<QzoneDetail> {
    return await this.core.apis.QzoneApi.getMsgDetail(payload.feed_ref);
  }
}
