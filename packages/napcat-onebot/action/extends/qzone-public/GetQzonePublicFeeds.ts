import { Static, Type } from '@sinclair/typebox';
import type { QzonePublicFeedsPage } from '@/napcat-core/data/qzone-public';
import { ActionName } from '@/napcat-onebot/action/router';
import { QzonePublicAction, QzonePublicFeedExample, QzonePublicObjectSchema } from './common';

const PayloadSchema = Type.Object({
  cursor: Type.Optional(Type.String({ minLength: 1, maxLength: 65536, description: '上一页返回的非空 next_cursor，首次请求可省略；数字或布尔值会转为文本' })),
});
type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  feeds: Type.Array(QzonePublicObjectSchema, { description: '完整动态对象，可直接传给详情和互动接口' }),
  has_more: Type.Boolean({ description: '是否还有下一页' }),
  next_cursor: Type.Union([Type.String(), Type.Null()], { description: '下一页游标，没有下一页时为 null' }),
}, { additionalProperties: true, description: '动态列表分页结果，保留上游返回的额外字段' });

export class GetQzonePublicFeeds extends QzonePublicAction<PayloadType, QzonePublicFeedsPage> {
  override actionName = ActionName.GetQzonePublicFeeds;
  override actionSummary = '获取空友爱看动态';
  override actionDescription = '获取空友爱看动态列表；后续操作应直接传入 feeds 中的完整对象，翻页使用 next_cursor';
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override payloadExample = {};
  override returnExample = { feeds: [QzonePublicFeedExample], has_more: false, next_cursor: null };

  async _handle (payload: PayloadType): Promise<QzonePublicFeedsPage> {
    return this.core.apis.QzonePublicApi.getFeeds(payload.cursor);
  }
}
