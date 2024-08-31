import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetRobotUinRange extends BaseAction<void, Array<any>> {
    actionName = ActionName.GetRobotUinRange;

    async _handle(payload: void) {
        return await this.core.apis.UserApi.getRobotUinRange();
    }
}
