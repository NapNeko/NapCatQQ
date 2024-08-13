import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export default class GetGuildProfile extends BaseAction<null, null> {
    actionName = ActionName.GetGuildProfile;

    async _handle(payload: null): Promise<null> {
        return null;
    }
}
