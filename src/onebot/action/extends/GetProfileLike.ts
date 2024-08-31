import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetProfileLike extends BaseAction<void, any> {
    actionName = ActionName.GetProfileLike;

    async _handle(payload: void) {
        const ret = await this.core.apis.UserApi.getProfileLike(this.core.selfInfo.uid);
        const listdata: any[] = ret.info.userLikeInfos[0].favoriteInfo.userInfos;
        for (let i = 0; i < listdata.length; i++) {
            listdata[i].uin = parseInt((await this.core.apis.UserApi.getUinByUidV2(listdata[i].uid)) || '');
        }
        return listdata;
    }
}
