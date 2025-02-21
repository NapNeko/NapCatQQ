import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetGuildList extends OneBotAction<void, void> {
    override actionName = ActionName.GetGuildList;

    async _handle(): Promise<void> {
        return;
    }
}
