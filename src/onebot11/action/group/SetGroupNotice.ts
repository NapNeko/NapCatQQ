import { WebApi } from '@/core/apis/webapi';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface PayloadType {
    group_id: number
}

export class SetGroupNotice extends BaseAction<PayloadType, null> {
  actionName = ActionName.GoCQHTTP_SetGroupNotice;

  protected async _handle(payload: PayloadType) {
    const group = payload.group_id.toString();
    WebApi.setGroupNotice(group);
    return null;
  }
}