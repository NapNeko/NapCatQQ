import SendMsg, { normalize } from '@/onebot/action/msg/SendMsg';
import { OB11PostSendMsg } from '@/onebot/types';
import { ActionName } from '@/onebot/action/router';

// 未验证
export class GoCQHTTPSendForwardMsg extends SendMsg {
    actionName = ActionName.GoCQHTTP_SendForwardMsg;

    protected async check(payload: OB11PostSendMsg) {
        if (payload.messages) payload.message = normalize(payload.messages);
        return super.check(payload);
    }
}

export class GoCQHTTPSendPrivateForwardMsg extends GoCQHTTPSendForwardMsg {
    actionName = ActionName.GoCQHTTP_SendPrivateForwardMsg;
}

export class GoCQHTTPSendGroupForwardMsg extends GoCQHTTPSendForwardMsg {
    actionName = ActionName.GoCQHTTP_SendGroupForwardMsg;
}
