import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

interface ReturnType {
    yes: boolean;
}

export class CanSend extends OneBotAction<any, ReturnType> {
    async _handle(_payload: void): Promise<ReturnType> {
        return {
            yes: true,
        };
    }
}


export default class CanSendRecord extends CanSend{
    actionName = ActionName.CanSendRecord;
}
