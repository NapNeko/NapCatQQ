import { ContextMode, ReturnDataType, SendMsgBase, SendMsgPayload } from './SendMsg';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';

// 未检测参数
class SendPrivateMsg extends SendMsgBase {
  override actionName = ActionName.SendPrivateMsg;
  override actionSummary = '发送私聊消息';
  override actionDescription = '发送私聊消息';
  override actionTags = ['消息接口'];
  override payloadExample = {
    user_id: '123456789',
    message: 'hello'
  };
  override returnExample = {
    message_id: 123456
  };

  protected override async check (payload: SendMsgPayload): Promise<BaseCheckResult> {
    payload.message_type = 'private';
    return super.check(payload);
  }

  override async _handle (payload: SendMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Private);
  }
}

export default SendPrivateMsg;
