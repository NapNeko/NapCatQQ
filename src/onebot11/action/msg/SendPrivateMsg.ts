import SendMsg, { ContextMode } from './SendMsg';
import { ActionName, BaseCheckResult } from '../types';
import { OB11PostSendMsg } from '../../types';
// 未检测参数
class SendPrivateMsg extends SendMsg {
  actionName = ActionName.SendPrivateMsg;
  contextMode: ContextMode = ContextMode.Private;

  protected async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
    payload.message_type = 'private';
    return super.check(payload);
  }
}
export default SendPrivateMsg;
