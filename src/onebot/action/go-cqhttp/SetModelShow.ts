import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export default class SetModelShow extends BaseAction<null, null> {
    actionName = ActionName.SetModelShow;

    async _handle(payload: null): Promise<null> {
        return null;
    }
}
