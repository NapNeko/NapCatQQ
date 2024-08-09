import BaseAction from '../BaseAction';
import {
  NTQQMsgApi,
  NTQQFriendApi,
  NTQQGroupApi,
  NTQQUserApi,
  NTQQFileApi,
} from '@/core';
import { ActionName } from '../types';
interface Payload {
  method: string,
  args: any[],
}

export default class Debug extends BaseAction<Payload, any> {
  actionName = ActionName.Debug;

  protected async _handle(payload: Payload): Promise<any> {
    const ntqqApi = [NTQQMsgApi, NTQQFriendApi, NTQQGroupApi, NTQQUserApi, NTQQFileApi,];
    for (const ntqqApiClass of ntqqApi) {
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
  }
}
