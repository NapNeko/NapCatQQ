import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
//兼容性代码
export class GoCQHTTPSetModelShow extends OneBotAction<void, void> {
    override actionName = ActionName.GoCQHTTP_SetModelShow;

    async _handle() {
        return;
    }
}
