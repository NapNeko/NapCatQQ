import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetGuildList extends OneBotAction<null, null> {
    actionName = ActionName.GetGuildList;

    async _handle(payload: null): Promise<null> {
        return null;
    }
}
