import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';
import type { QzoneMsgPage } from '@/napcat-core/data/qzone-rpc';
import type { SlQzoneMsgList } from '@/napcat-core/data/qzone-snowluma';
import { QzoneCursorSchema, QzoneMsgListReturnSchema } from './common';
import { normalizeQzoneListPayload, QzoneFormatSchema, SlQzoneIntegerSchema, SlQzoneMsgListExample, SlQzoneMsgListReturnSchema, SlQzoneUinSchema } from './common-snowluma';

export const GetQzoneMsgListPayloadSchema = Type.Object({
  format: QzoneFormatSchema,
  target_uin: Type.Optional(SlQzoneUinSchema),
  pos: Type.Optional(SlQzoneIntegerSchema),
  num: Type.Optional(SlQzoneIntegerSchema),
  cursor: QzoneCursorSchema,
}, { additionalProperties: Type.Unknown() });
export type GetQzoneMsgListPayload = Static<typeof GetQzoneMsgListPayloadSchema>;

export class GetQzoneMsgList extends OneBotAction<GetQzoneMsgListPayload, QzoneMsgPage | SlQzoneMsgList> {
  override actionName = ActionName.GetQzoneMsgList;
  override actionSummary = '获取QQ空间说说列表';
  override actionDescription = '默认返回 SnowLuma 的 total/msglist，pos 默认0、num 默认20（1至100）。format=native 保留原 H5 Feed、feed_ref 和游标；仅传旧 cursor 也会选择 native。两种分页参数不能混用。';
  override actionTags = ['扩展接口'];
  override payloadExample = { target_uin: '10001', pos: 0, num: 20 };
  override returnExample = SlQzoneMsgListExample;
  override payloadSchema = GetQzoneMsgListPayloadSchema;
  override returnSchema = Type.Union([SlQzoneMsgListReturnSchema, QzoneMsgListReturnSchema]);

  protected override async check (payload: GetQzoneMsgListPayload): Promise<BaseCheckResult> {
    try { normalizeQzoneListPayload(payload); } catch (error) { return { valid: false, message: (error as Error).message }; }
    return await super.check(payload);
  }

  async _handle (payload: GetQzoneMsgListPayload): Promise<QzoneMsgPage | SlQzoneMsgList> {
    const normalized = normalizeQzoneListPayload(payload);
    if (normalized.format === 'native') return await this.core.apis.QzoneApi.getMsgList(normalized.targetUin, normalized.cursor);
    return await this.core.apis.QzoneApi.getSnowlumaMsgList(normalized.targetUin, normalized.pos, normalized.num);
  }
}
