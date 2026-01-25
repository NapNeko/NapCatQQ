import { ContextMode, normalize, ReturnDataType, SendMsgBase, SendMsgPayload } from '@/napcat-onebot/action/msg/SendMsg';
import { ActionName } from '@/napcat-onebot/action/router';

// 未验证
type GoCQHTTPSendForwardMsgPayload = SendMsgPayload & { messages?: any; };

export class GoCQHTTPSendForwardMsgBase extends SendMsgBase {
  protected override async check (payload: GoCQHTTPSendForwardMsgPayload) {
    if (payload.messages) payload.message = normalize(payload.messages);
    return super.check(payload);
  }
}
export class GoCQHTTPSendForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendForwardMsg;

  protected override async check (payload: GoCQHTTPSendForwardMsgPayload) {
    if (payload.messages) payload.message = normalize(payload.messages);
    return super.check(payload);
  }
}
export class GoCQHTTPSendPrivateForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendPrivateForwardMsg;
  override async _handle (payload: SendMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Private);
  }
}

export class GoCQHTTPSendGroupForwardMsg extends GoCQHTTPSendForwardMsgBase {
  override actionName = ActionName.GoCQHTTP_SendGroupForwardMsg;
  override async _handle (payload: SendMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Group);
  }
}
