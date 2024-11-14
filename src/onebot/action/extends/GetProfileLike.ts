import BaseAction from '../BaseAction';
import { ActionName } from '../types';

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
        const listdata = ret.info.userLikeInfos[0].voteInfo.userInfos;
        for (const item of listdata) {
            item.uin = parseInt((await this.core.apis.UserApi.getUinByUidV2(item.uid)) || '');
        }
        return ret.info.userLikeInfos[0].voteInfo;
    }
}
