import { ContextMode, SendMsgBase } from './SendMsg';
import { ActionName, BaseCheckResult } from '@/onebot/action/router';
import { OB11PostSendMsg } from '@/onebot/types';

// 未检测参数
class SendPrivateMsg extends SendMsgBase {
    override actionName = ActionName.SendPrivateMsg;
    override contextMode: ContextMode = ContextMode.Private;

    protected override async check(payload: OB11PostSendMsg): Promise<BaseCheckResult> {
        payload.message_type = 'private';
        return super.check(payload);
    }
}

export default SendPrivateMsg;
