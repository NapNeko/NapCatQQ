import { WebApi, WebApiGroupNoticeRet } from '@/core/apis/webapi';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface PayloadType {
    group_id: number
}

export class GetGroupNotice extends BaseAction<PayloadType, WebApiGroupNoticeRet> {
    actionName = ActionName.GoCQHTTP_GetGroupNotice;

    protected async _handle(payload: PayloadType) {
        const group = payload.group_id.toString();
        let ret = await WebApi.getGrouptNotice(group);
        if (!ret) {
            throw new Error('获取公告失败');
        }
        return ret;
    }
}