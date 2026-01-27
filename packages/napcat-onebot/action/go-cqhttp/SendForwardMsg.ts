import { OB11MessageMixType } from '@/napcat-onebot/types';
import { ContextMode, normalize, ReturnDataType, SendMsgBase, SendMsgPayload } from '@/napcat-onebot/action/msg/SendMsg';
import { ActionName } from '@/napcat-onebot/action/router';

// 未验证
type GoCQHTTPSendForwardMsgPayload = SendMsgPayload & { messages?: OB11MessageMixType; };

export class GoCQHTTPSendForwardMsgBase extends SendMsgBase {
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
    messages: []
  };
  override returnExample = {
    message_id: 123456
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
    messages: []
  };
  override returnExample = {
    message_id: 123456
  };
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
    messages: []
  };
  override returnExample = {
    message_id: 123456
  };
  override async _handle (payload: GoCQHTTPSendForwardMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Group);
  }
}
