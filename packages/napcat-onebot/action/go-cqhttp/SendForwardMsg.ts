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
  override actionDescription = '发送合并转发消息';
  override actionTags = ['消息接口'];

  protected override async check (payload: GoCQHTTPSendForwardMsgPayload) {
    if (payload.messages) payload.message = normalize(payload.messages);
    return super.check(payload);
  }
}
export class GoCQHTTPSendPrivateForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendPrivateForwardMsg;
  override async _handle (payload: GoCQHTTPSendForwardMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Private);
  }
}

export class GoCQHTTPSendGroupForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendGroupForwardMsg;
  override async _handle (payload: GoCQHTTPSendForwardMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Group);
  }
}
