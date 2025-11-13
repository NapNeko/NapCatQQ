import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

interface ResponseType {
  online: boolean;
  good: boolean;
  stat: unknown;
}
export default class GetStatus extends OneBotAction<void, ResponseType> {
  override actionName = ActionName.GetStatus;

  async _handle (): Promise<ResponseType> {
    return {
      online: !!this.core.selfInfo.online,
      good: true,
      stat: {},
    };
  }
}
