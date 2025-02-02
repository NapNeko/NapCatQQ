import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetCSRF extends OneBotAction<void, { token: number }> {
    override actionName = ActionName.GetCSRF;

    async _handle() {
        const sKey = await this.core.apis.UserApi.getSKey();
        if (!sKey) {
            throw new Error('SKey is undefined');
        }
        return {
            token: +this.core.apis.WebApi.getBknFromSKey(sKey),
        };
    }
}
