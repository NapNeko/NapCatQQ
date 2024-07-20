import { selfInfo } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';

export class GetProfileLike extends BaseAction<void, any> {
    actionName = ActionName.GetProfileLike;
    protected async _handle(payload: void) {
        let ret = await NTQQUserApi.getProfileLike(selfInfo.uid);
        let listdata: any[] = ret.info.userLikeInfos[0].favoriteInfo.userInfos;
        for (let i = 0; i < listdata.length; i++) {
            listdata[i].uin = parseInt((await NTQQUserApi.getUinByUid(listdata[i].uid)) || '');
        }
        return listdata;
    }
}
