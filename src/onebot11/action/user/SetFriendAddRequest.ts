import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi } from '@/core/apis/friend';
import { friendRequests } from '@/common/data';

interface Payload {
  flag: string,
  approve: boolean,
  remark?: string,
}

export default class SetFriendAddRequest extends BaseAction<Payload, null> {
  actionName = ActionName.SetFriendAddRequest;

  protected async _handle(payload: Payload): Promise<null> {
    const approve = payload.approve.toString() === 'true';
    const request = friendRequests[payload.flag];
    await NTQQFriendApi.handleFriendRequest(request, approve);
    return null;
  }
}
