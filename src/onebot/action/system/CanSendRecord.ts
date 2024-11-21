import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

interface ReturnType {
    yes: boolean;
}

export default class CanSendRecord extends OneBotAction<any, ReturnType> {
    actionName = ActionName.CanSendRecord;

    async _handle(_payload: void): Promise<ReturnType> {
        return {
            yes: true,
        };
    }
}
