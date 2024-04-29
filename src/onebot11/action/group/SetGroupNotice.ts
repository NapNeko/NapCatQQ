import { WebApi } from '@/core/apis/webapi';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface PayloadType {
  group_id: number;
  content: string;
}

export class SetGroupNotice extends BaseAction<PayloadType, any> {
  actionName = ActionName.GoCQHTTP_SetGroupNotice;

  protected async _handle(payload: PayloadType) {
    const group = payload.group_id.toString();
    return await WebApi.setGroupNotice(group, payload.content);
  }
}