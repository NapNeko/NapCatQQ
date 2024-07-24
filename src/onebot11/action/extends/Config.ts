import BaseAction from '../BaseAction';
import { OB11Config, ob11Config } from '@/onebot11/config';
import { ActionName } from '../types';


export class GetConfigAction extends BaseAction<null, OB11Config> {
  actionName = ActionName.GetConfig;

  protected async _handle(payload: null): Promise<OB11Config> {
    return ob11Config;
  }
}

export class SetConfigAction extends BaseAction<OB11Config, void> {
  actionName = ActionName.SetConfig;

  protected async _handle(payload: OB11Config): Promise<void> {
    ob11Config.save(payload, true);
  }
}
