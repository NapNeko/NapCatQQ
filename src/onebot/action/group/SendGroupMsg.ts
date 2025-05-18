import { ContextMode, ReturnDataType, SendMsgBase } from '@/onebot/action/msg/SendMsg';
import { ActionName, BaseCheckResult } from '@/onebot/action/router';
import { OB11PostSendMsg } from '@/onebot/types';

// 未检测参数
class SendGroupMsg extends SendMsgBase {
    override actionName = ActionName.SendGroupMsg;

    protected override async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
        delete payload.user_id;
        payload.message_type = 'group';
        return super.check(payload);
    }
    override async _handle(payload: OB11PostSendMsg): Promise<ReturnDataType> {
        return this.base_handle(payload, ContextMode.Group);
    }
}

export default SendGroupMsg;
