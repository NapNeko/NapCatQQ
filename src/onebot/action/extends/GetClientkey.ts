import { ActionName } from '@/onebot/action/router';
import { OneBotAction } from '../OneBotAction';

interface GetClientkeyResponse {
    clientkey?: string;
}

export class GetClientkey extends OneBotAction<void, GetClientkeyResponse> {
    actionName = ActionName.GetClientkey;

    async _handle() {
        return { clientkey: (await this.core.apis.UserApi.forceFetchClientKey()).clientKey };
    }
}
