import type { OB11MessageMixType } from '@/napcat-onebot/types';
import { ContextMode, normalize, ReturnDataType, SendMsgBase, SendMsgPayload, SendMsgPayloadSchema } from '@/napcat-onebot/action/msg/SendMsg';
import { ActionName } from '@/napcat-onebot/action/router';
import type { BaseCheckResult } from '@/napcat-onebot/action/router';
import { OB11MessageMixTypeSchema } from '@/napcat-onebot/types/message';
import { Type } from '@sinclair/typebox';

// 未验证
type GoCQHTTPSendForwardMsgPayload = SendMsgPayload & { messages?: OB11MessageMixType; };

const GoCQHTTPSendForwardPayloadSchema = Type.Union([
  SendMsgPayloadSchema,
  Type.Intersect([
    Type.Omit(SendMsgPayloadSchema, ['message']),
    Type.Object({
      messages: OB11MessageMixTypeSchema,
      message: Type.Optional(OB11MessageMixTypeSchema),
    }),
  ]),
]);

export class GoCQHTTPSendForwardMsgBase extends SendMsgBase {
  override payloadSchema = GoCQHTTPSendForwardPayloadSchema;

  protected override async check (payload: GoCQHTTPSendForwardMsgPayload) {
    if (payload.messages) payload.message = normalize(payload.messages);
    return super.check(payload);
  }
}
export class GoCQHTTPSendForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendForwardMsg;
  override actionSummary = '发送合并转发消息';
  override actionDescription = '发送合并转发消息';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {
    group_id: '123456789',
    messages: [],
  };

  override returnExample = {
    message_id: 123456,
  };

  protected override async check (payload: GoCQHTTPSendForwardMsgPayload) {
    if (payload.messages) payload.message = normalize(payload.messages);
    return super.check(payload);
  }
}
export class GoCQHTTPSendPrivateForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendPrivateForwardMsg;
  override actionSummary = '发送私聊合并转发消息';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {
    user_id: '123456789',
    messages: [],
  };

  override returnExample = {
    message_id: 123456,
  };

  protected override async check (payload: GoCQHTTPSendForwardMsgPayload): Promise<BaseCheckResult> {
    payload.message_type = 'private';
    if (!payload.user_id) {
      return {
        valid: false,
        message: '缺少参数 user_id',
      };
    }
    return super.check(payload);
  }

  override async _handle (payload: GoCQHTTPSendForwardMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Private);
  }
}

export class GoCQHTTPSendGroupForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendGroupForwardMsg;
  override actionSummary = '发送群合并转发消息';
  override actionTags = ['Go-CQHTTP'];
  override payloadExample = {
    group_id: '123456789',
    messages: [],
  };

  override returnExample = {
    message_id: 123456,
  };

  protected override async check (payload: GoCQHTTPSendForwardMsgPayload): Promise<BaseCheckResult> {
    payload.message_type = 'group';
    if (!payload.group_id) {
      return {
        valid: false,
        message: '缺少参数 group_id',
      };
    }
    return super.check(payload);
  }

  override async _handle (payload: GoCQHTTPSendForwardMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Group);
  }
}
