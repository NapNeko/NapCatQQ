import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { WebApi } from '@/core/apis';
interface Payload {
    group_id: string;
    content: string;
    image?: string;
}
export class SendGroupNotice extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_SendGroupNotice;

    protected async _handle(payload: Payload) {
        await WebApi.setGroupNotice(payload.group_id, payload.content);
        //返回值验证没做
        return null;
    }
}
