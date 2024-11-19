import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '../types';

export default class GetGuildList extends OneBotAction<null, null> {
    actionName = ActionName.GetGuildList;

    async _handle(payload: null): Promise<null> {
        return null;
    }
}
