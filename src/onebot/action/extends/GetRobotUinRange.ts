import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetRobotUinRange extends BaseAction<void, Array<any>> {
    actionName = ActionName.GetRobotUinRange;

    async _handle(payload: void) {
        const NTQQUserApi = this.CoreContext.apis.UserApi;
        return await NTQQUserApi.getRobotUinRange();
    }
}
