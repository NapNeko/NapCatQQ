import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { QuickAction, QuickActionEvent } from '@/onebot/types';

interface Payload {
    context: QuickActionEvent,
    operation: QuickAction
}

export class GoCQHTTPHandleQuickAction extends BaseAction<Payload, null> {
    actionName = ActionName.GoCQHTTP_HandleQuickAction;

    async _handle(payload: Payload): Promise<null> {
        this.obContext.apis.QuickActionApi
            .handleQuickOperation(payload.context, payload.operation)
            .catch(this.core.context.logger.logError.bind(this.core.context.logger));
        return null;
    }
}
