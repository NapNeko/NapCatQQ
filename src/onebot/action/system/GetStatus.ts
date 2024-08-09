import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export default class GetStatus extends BaseAction<any, any> {
  actionName = ActionName.GetStatus;

  protected async _handle(payload: any): Promise<any> {
    return {
      online: !!this.CoreContext.selfInfo.online,
      good: true,
      stat:{}
    };
  }
}
