import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { sleep } from '@/common/helper';

export class GetOnlineClient extends OneBotAction<void, Array<any>> {
    actionName = ActionName.GetOnlineClient;

    async _handle(payload: void) {
        //注册监听
        this.core.apis.SystemApi.getOnlineDev();
        await sleep(500);

        return [];
    }
}
