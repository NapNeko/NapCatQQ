import BaseAction from '../BaseAction';
// import * as ntqqApi from "../../../ntqqapi/api";
import {
  NTQQMsgApi,
  NTQQFriendApi,
  NTQQGroupApi,
  NTQQUserApi,
  NTQQFileApi,
  // NTQQFileCacheApi,
  NTQQWindowApi,
} from '@/core';
import { ActionName } from '../types';
import { log, logDebug } from '@/common/utils/log';

interface Payload {
  method: string,
  args: any[],
}

export default class Debug extends BaseAction<Payload, any> {
  actionName = ActionName.Debug;

  protected async _handle(payload: Payload): Promise<any> {
    logDebug('debug call ntqq api', payload);
    const ntqqApi = [NTQQMsgApi, NTQQFriendApi, NTQQGroupApi, NTQQUserApi, NTQQFileApi,
      // NTQQFileCacheApi,
      NTQQWindowApi];
    for (const ntqqApiClass of ntqqApi) {
      logDebug('ntqqApiClass', ntqqApiClass);
      const method = (<any>ntqqApiClass)[payload.method];
      if (method) {
        const result = method(...payload.args);
        if (method.constructor.name === 'AsyncFunction') {
          return await result;
        }
        return result;
      }
    }
    throw `${payload.method}方法 不存在`;

    // const info = await NTQQApi.getUserDetailInfo(friends[0].uid);
    // return info
  }
}
