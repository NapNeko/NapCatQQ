import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class FetchUserProfileLike extends OneBotAction<{ qq: number }, any> {
    actionName = ActionName.FetchUserProfileLike;

    async _handle(payload: { qq: number }) {
        if (!payload.qq) throw new Error('qq is required');
        return await this.core.apis.UserApi.getUidByUinV2(payload.qq.toString());
    }
}
