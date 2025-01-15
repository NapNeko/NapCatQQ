import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetGuildProfile extends OneBotAction<null, null> {
    actionName = ActionName.GetGuildProfile;

    async _handle(payload: null): Promise<null> {
        return null;
    }
}
