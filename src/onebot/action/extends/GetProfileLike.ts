import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';

interface Payload {
    start: number,
    count: number
}

export class GetProfileLike extends BaseAction<Payload, any> {
    actionName = ActionName.GetProfileLike;

    async _handle(payload: Payload) {
        const start = payload.start ? Number(payload.start) : 0;
        const count = payload.count ? Number(payload.count) : 10;
        const ret = await this.core.apis.UserApi.getProfileLike(this.core.selfInfo.uid, start, count);
        const listdata: any[] = ret.info.userLikeInfos[0].voteInfo.userInfos;
        for (let i = 0; i < listdata.length; i++) {
            listdata[i].uin = parseInt((await this.core.apis.UserApi.getUinByUidV2(listdata[i].uid)) || '');
        }
        return ret.info.userLikeInfos[0].voteInfo;
    }
}
