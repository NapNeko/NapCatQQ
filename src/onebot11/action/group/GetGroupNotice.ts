import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface PayloadType {
    group_id: number
}

export class GetGroupNotice extends BaseAction<PayloadType, null> {
  actionName = ActionName.GoCQHTTP_GetGroupNotice;

  protected async _handle(payload: PayloadType) {
    const group = payload.group_id.toString();
    // WebApi.getGrouptNotice(group);
    return null;
  }
}