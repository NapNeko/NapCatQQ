import BaseAction from '../BaseAction';
import { ActionName } from '../types';
export class GetOnlineClient extends BaseAction<void, Array<any>> {
  actionName = ActionName.GetRobotUinRange;

  protected async _handle(payload: void) {

  }
}
