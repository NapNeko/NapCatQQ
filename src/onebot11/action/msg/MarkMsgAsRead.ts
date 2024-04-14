import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface Payload{
    message_id: number
}

export default class GoCQHTTPMarkMsgAsRead extends BaseAction<Payload, null>{
  actionName = ActionName.GoCQHTTP_MarkMsgAsRead;

  protected async _handle(payload: Payload): Promise<null> {
    return null;
  }
}