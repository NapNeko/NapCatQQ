import { Static, Type } from '@sinclair/typebox';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import type { QzoneMsgPage } from '@/napcat-core/data/qzone-rpc';
import { QzoneCursorSchema, QzoneFeedItemExample, QzoneMsgListReturnSchema } from './common';

export const GetQzoneMsgListPayloadSchema = Type.Object({
  target_uin: Type.Optional(Type.Union([
    Type.String({ pattern: '^[1-9][0-9]*$', maxLength: 20 }),
    Type.Integer({ minimum: 1, maximum: Number.MAX_SAFE_INTEGER }),
  ], { description: '空间所属 QQ 号；不传时为当前账号' })),
  cursor: QzoneCursorSchema,
}, { additionalProperties: false });
export type GetQzoneMsgListPayload = Static<typeof GetQzoneMsgListPayloadSchema>;

export class GetQzoneMsgList extends OneBotAction<GetQzoneMsgListPayload, QzoneMsgPage> {
  override actionName = ActionName.GetQzoneMsgList;
  override actionSummary = '获取QQ空间说说列表';
  override actionDescription = 'target_uin 是说说所属账号。使用 next_cursor 续页，不支持 pos/num，也不虚构 total；请保留每条说说的 feed_ref 用于后续操作。';
  override actionTags = ['扩展接口'];
  override payloadExample = { target_uin: '10001' };
  override returnExample = { msglist: [QzoneFeedItemExample], has_more: false, next_cursor: null };
  override payloadSchema = GetQzoneMsgListPayloadSchema;
  override returnSchema = QzoneMsgListReturnSchema;

  async _handle (payload: GetQzoneMsgListPayload): Promise<QzoneMsgPage> {
    return await this.core.apis.QzoneApi.getMsgList(
      payload.target_uin === undefined ? undefined : String(payload.target_uin),
      payload.cursor
    );
  }
}
