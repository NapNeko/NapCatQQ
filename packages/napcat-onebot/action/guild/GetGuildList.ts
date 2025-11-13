import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

export class GetGuildList extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildList;

  async _handle (): Promise<void> {

  }
}
