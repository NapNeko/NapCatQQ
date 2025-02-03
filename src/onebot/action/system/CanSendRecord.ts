import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

interface ReturnType {
    yes: boolean;
}

export class CanSend extends OneBotAction<void, ReturnType> {
    async _handle(): Promise<ReturnType> {
        return {
            yes: true,
        };
    }
}


export default class CanSendRecord extends CanSend{
    override actionName = ActionName.CanSendRecord;
}
