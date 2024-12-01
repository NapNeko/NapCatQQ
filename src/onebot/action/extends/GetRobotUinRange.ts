import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetRobotUinRange extends OneBotAction<void, Array<any>> {
    actionName = ActionName.GetRobotUinRange;

    async _handle() {
        return await this.core.apis.UserApi.getRobotUinRange();
    }
}
