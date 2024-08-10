import { handleQuickOperation } from '@/onebot/helper/quick';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { QuickAction, QuickActionEvent } from '@/onebot/types';

interface Payload{
  context: QuickActionEvent,
  operation: QuickAction
}

export class GoCQHTTPHandleQuickAction extends BaseAction<Payload, null>{
    actionName = ActionName.GoCQHTTP_HandleQuickAction;
    protected async _handle(payload: Payload): Promise<null> {
        handleQuickOperation(this.CoreContext,payload.context, payload.operation).then().catch(this.CoreContext.context.logger.logError);
        return null;
    }
}