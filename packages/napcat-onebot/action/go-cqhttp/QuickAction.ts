import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { QuickAction, QuickActionEvent } from '@/napcat-onebot/types';
import { Static, Type } from '@sinclair/typebox';

const SenderSchema = Type.Object({
  user_id: Type.Number({ description: '用户ID' }),
  nickname: Type.String({ description: '昵称' }),
  sex: Type.Optional(Type.String({ description: '性别' })),
  age: Type.Optional(Type.Number({ description: '年龄' })),
  card: Type.Optional(Type.String({ description: '群名片' })),
  level: Type.Optional(Type.String({ description: '群等级' })),
  role: Type.Optional(Type.String({ description: '群角色' })),
});

// 定义 QuickAction 的详细 Schema
const QuickActionSchema = Type.Object({
  reply: Type.Optional(Type.String({ description: '回复内容' })),
  auto_escape: Type.Optional(Type.Boolean({ description: '是否作为纯文本发送' })),
  at_sender: Type.Optional(Type.Boolean({ description: '是否 @ 发送者' })),
  delete: Type.Optional(Type.Boolean({ description: '是否撤回该消息' })),
  kick: Type.Optional(Type.Boolean({ description: '是否踢出发送者' })),
  ban: Type.Optional(Type.Boolean({ description: '是否禁言发送者' })),
  ban_duration: Type.Optional(Type.Number({ description: '禁言时长' })),
  approve: Type.Optional(Type.Boolean({ description: '是否同意请求/加群' })),
  remark: Type.Optional(Type.String({ description: '好友备注' })),
  reason: Type.Optional(Type.String({ description: '拒绝理由' })),
}, { description: '快速操作内容' });

// 定义 QuickActionEvent 的详细 Schema
const QuickActionEventSchema = Type.Object({
  time: Type.Number({ description: '事件发生时间' }),
  self_id: Type.Number({ description: '收到事件的机器人 QQ 号' }),
  post_type: Type.String({ description: '上报类型' }),
  message_type: Type.Optional(Type.String({ description: '消息类型' })),
  sub_type: Type.Optional(Type.String({ description: '消息子类型' })),
  user_id: Type.Union([Type.Number(), Type.String()], { description: '发送者 QQ 号' }),
  group_id: Type.Optional(Type.Union([Type.Number(), Type.String()], { description: '群号' })),
  message_id: Type.Optional(Type.Number({ description: '消息 ID' })),
  message_seq: Type.Optional(Type.Number({ description: '消息序列号' })),
  real_id: Type.Optional(Type.Number({ description: '真实消息 ID' })),
  sender: Type.Optional(SenderSchema),
  message: Type.Optional(Type.Any({ description: '消息内容' })),
  message_format: Type.Optional(Type.String({ description: '消息格式' })),
  raw_message: Type.Optional(Type.String({ description: '原始消息内容' })),
  font: Type.Optional(Type.Number({ description: '字体' })),
  notice_type: Type.Optional(Type.String({ description: '通知类型' })),
  meta_event_type: Type.Optional(Type.String({ description: '元事件类型' })),
}, { description: '事件上下文' });

export const GoCQHTTPHandleQuickActionPayloadSchema = Type.Object({
  context: QuickActionEventSchema,
  operation: QuickActionSchema,
});

export type GoCQHTTPHandleQuickActionPayload = {
  context: QuickActionEvent;
  operation: QuickAction;
} & Static<typeof GoCQHTTPHandleQuickActionPayloadSchema>;

export class GoCQHTTPHandleQuickAction extends OneBotAction<GoCQHTTPHandleQuickActionPayload, void> {
  override actionName = ActionName.GoCQHTTP_HandleQuickAction;
  override payloadSchema = GoCQHTTPHandleQuickActionPayloadSchema;
  override returnSchema = Type.Null();

  async _handle (payload: GoCQHTTPHandleQuickActionPayload): Promise<void> {
    this.obContext.apis.QuickActionApi
      .handleQuickOperation(payload.context, payload.operation)
      .catch(e => this.core.context.logger.logError(e));
  }
}
