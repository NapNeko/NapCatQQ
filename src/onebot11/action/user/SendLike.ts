import { NTQQUserApi } from '@/core/apis';
import BaseAction from '../BaseAction';
import { getFriend, getUidByUin, uid2UinMap } from '@/common/data';
import { ActionName } from '../types';
import { log, logDebug } from '@/common/utils/log';

interface Payload {
  user_id: number,
  times: number
}

export default class SendLike extends BaseAction<Payload, null> {
  actionName = ActionName.SendLike;

  protected async _handle(payload: Payload): Promise<null> {
    logDebug('点赞参数', payload);
    try {
      const qq = payload.user_id.toString();
      const friend = await getFriend(qq);
      let uid: string;
      if (!friend) {
        uid = getUidByUin(qq) || '';
      } else {
        uid = friend.uid;
      }
      const result = await NTQQUserApi.like(uid, parseInt(payload.times?.toString()) || 1);
      logDebug('点赞结果', result);
      if (result.result !== 0) {
        throw Error(result.errMsg);
      }
    } catch (e) {
      throw `点赞失败 ${e}`;
    }
    return null;
  }
}
