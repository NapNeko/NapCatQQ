import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class FetchOtherProfileLike extends BaseAction<{ qq: number }, any> {
    actionName = ActionName.FetchOtherProfileLike;

    async _handle(payload: { qq: number }) {
        if (!payload.qq) throw new Error('qq is required');
        return await this.core.apis.UserApi.getUidByUinV2(payload.qq.toString());
    }
}
