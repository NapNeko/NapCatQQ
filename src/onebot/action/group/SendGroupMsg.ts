import { ContextMode, SendMsgBase } from '@/onebot/action/msg/SendMsg';
import { ActionName, BaseCheckResult } from '@/onebot/action/router';
import { OB11PostSendMsg } from '@/onebot/types';

// 未检测参数
class SendGroupMsg extends SendMsgBase {
    override actionName = ActionName.SendGroupMsg;
    override contextMode: ContextMode = ContextMode.Group;

    protected override async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
        delete payload.user_id;
        payload.message_type = 'group';
        return super.check(payload);
    }
}

export default SendGroupMsg;
