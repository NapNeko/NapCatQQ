import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { QuickAction, QuickActionEvent } from '@/napcat-onebot/types';

interface Payload {
  context: QuickActionEvent,
  operation: QuickAction
}

export class GoCQHTTPHandleQuickAction extends OneBotAction<Payload, null> {
  override actionName = ActionName.GoCQHTTP_HandleQuickAction;

  async _handle (payload: Payload): Promise<null> {
    this.obContext.apis.QuickActionApi
      .handleQuickOperation(payload.context, payload.operation)
      .catch(e => this.core.context.logger.logError(e));
    return null;
  }
}
