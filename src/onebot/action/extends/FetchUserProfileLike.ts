import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class FetchUserProfileLike extends BaseAction<{ qq: number }, any> {
    actionName = ActionName.FetchUserProfileLike;

    async _handle(payload: { qq: number }) {
        if (!payload.qq) throw new Error('qq is required');
        return await this.core.apis.UserApi.getUidByUinV2(payload.qq.toString());
    }
}
