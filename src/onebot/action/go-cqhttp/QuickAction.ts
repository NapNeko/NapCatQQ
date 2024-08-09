import { log } from '@/common/utils/log';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { QuickAction, QuickActionEvent, handleQuickOperation } from '@/onebot11/server/postOB11Event';

interface Payload{
  context: QuickActionEvent,
  operation: QuickAction
}

export class GoCQHTTPHandleQuickAction extends BaseAction<Payload, null>{
  actionName = ActionName.GoCQHTTP_HandleQuickAction;
  protected async _handle(payload: Payload): Promise<null> {
    handleQuickOperation(payload.context, payload.operation).then().catch(log);
    return null;
  }
}