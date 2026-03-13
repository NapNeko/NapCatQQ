import { ContextMode, ReturnDataType, SendMsgBase, SendMsgPayload } from '@/napcat-onebot/action/msg/SendMsg';
import { ActionName, BaseCheckResult } from '@/napcat-onebot/action/router';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

// 未检测参数
class SendGroupMsg extends SendMsgBase {
  override actionName = ActionName.SendGroupMsg;
  override actionSummary = '发送群消息';
  override actionDescription = '发送群消息';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SendGroupMsg.payload;
  override returnExample = GroupActionsExamples.SendGroupMsg.response;

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
