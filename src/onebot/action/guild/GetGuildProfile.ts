import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetGuildProfile extends OneBotAction<void, void> {
    override actionName = ActionName.GetGuildProfile;

    async _handle(): Promise<void> {
        return;
    }
}
