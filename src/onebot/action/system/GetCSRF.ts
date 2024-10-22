import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetCSRF extends BaseAction<any, any> {
    actionName = ActionName.GetCSRF;

    async _handle(payload: any) {
        const sKey = await this.core.apis.UserApi.getSKey();
        if (!sKey) {
            throw new Error('SKey is undefined');
        }
        return {
            token: +this.core.apis.WebApi.getBknFromSKey(sKey),
        };
    }
}
