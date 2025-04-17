import { ContextMode, SendMsgBase } from './SendMsg';
import { ActionName } from '@/onebot/action/router';
import { OB11PostSendMsg } from '@/onebot/types';

// 未检测参数
class SendPrivateMsg extends SendMsgBase {
    override actionName = ActionName.SendPrivateMsg;
    override contextMode: ContextMode = ContextMode.Private;
    override async _handle(payload: OB11PostSendMsg) {
        if (payload.messages) payload.message = payload.messages;
        return super._handle(payload);
    }
}

export default SendPrivateMsg;
