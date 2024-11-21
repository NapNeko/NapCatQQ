import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export default class GetStatus extends OneBotAction<any, any> {
    actionName = ActionName.GetStatus;

    async _handle(payload: any): Promise<any> {
        return {
            online: !!this.core.selfInfo.online,
            good: true,
            stat: {},
        };
    }
}
