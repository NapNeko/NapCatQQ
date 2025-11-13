import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

export class GetGuildProfile extends OneBotAction<void, void> {
  override actionName = ActionName.GetGuildProfile;

  async _handle (): Promise<void> {

  }
}
