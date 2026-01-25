import { ContextMode, ReturnDataType, SendMsgBase, SendMsgPayload } from './SendMsg';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';

// 未检测参数
class SendPrivateMsg extends SendMsgBase {
  override actionName = ActionName.SendPrivateMsg;

  protected override async check (payload: SendMsgPayload): Promise<BaseCheckResult> {
    payload.message_type = 'private';
    return super.check(payload);
  }

  override async _handle (payload: SendMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Private);
  }
}

export default SendPrivateMsg;
