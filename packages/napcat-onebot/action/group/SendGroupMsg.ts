import { ContextMode, ReturnDataType, SendMsgBase, SendMsgPayload } from '@/napcat-onebot/action/msg/SendMsg';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';

import { ActionExamples } from '../examples';

// 未检测参数
class SendGroupMsg extends SendMsgBase {
  override actionName = ActionName.SendGroupMsg;
  override actionDescription = '发送群消息';
  override payloadExample = ActionExamples.SendGroupMsg.payload;
  override returnExample = ActionExamples.SendGroupMsg.return;

  protected override async check (payload: SendMsgPayload): Promise<BaseCheckResult> {
    delete payload.user_id;
    payload.message_type = 'group';
    return super.check(payload);
  }

  override async _handle (payload: SendMsgPayload): Promise<ReturnDataType> {
    return this.base_handle(payload, ContextMode.Group);
  }
}

export default SendGroupMsg;
