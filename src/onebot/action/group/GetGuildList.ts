import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export default class GetGuildList extends BaseAction<null, null> {
    actionName = ActionName.GetGuildList;

    async _handle(payload: null): Promise<null> {
        return null;
    }
}
