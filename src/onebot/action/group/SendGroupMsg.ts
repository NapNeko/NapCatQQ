import { ContextMode, SendMsgBase } from '@/onebot/action/msg/SendMsg';
import { ActionName } from '@/onebot/action/router';
import { OB11PostSendMsg } from '@/onebot/types';

// 未检测参数
class SendGroupMsg extends SendMsgBase {
    override actionName = ActionName.SendGroupMsg;
    override contextMode: ContextMode = ContextMode.Group;
    override async _handle(payload: OB11PostSendMsg) {
        delete payload.user_id;
        payload.message_type = 'group';
        return super._handle(payload);
    }
}

export default SendGroupMsg;
