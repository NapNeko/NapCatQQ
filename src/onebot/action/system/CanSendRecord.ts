import BaseAction from '../BaseAction';
import { ActionName } from '../types';

interface ReturnType {
    yes: boolean;
}

export default class CanSendRecord extends BaseAction<any, ReturnType> {
    actionName = ActionName.CanSendRecord;

    async _handle(_payload: void): Promise<ReturnType> {
        return {
            yes: true,
        };
    }
}
