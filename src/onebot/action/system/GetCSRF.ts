import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetCSRF extends BaseAction<any, any> {
    actionName = ActionName.GetCSRF;

    async _handle(payload: any) {
        return {
            token: "",
        };
    }
}
