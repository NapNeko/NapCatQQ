import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { napCatVersion } from 'napcat-common/src/version';
interface ResponseType {
  app_name: string;
  protocol_version: string;
  app_version: string;
}
export default class GetVersionInfo extends OneBotAction<void, ResponseType> {
  override actionName = ActionName.GetVersionInfo;

  async _handle (): Promise<ResponseType> {
    return {
      app_name: 'NapCat.Onebot',
      protocol_version: 'v11',
      app_version: napCatVersion,
    };
  }
}
