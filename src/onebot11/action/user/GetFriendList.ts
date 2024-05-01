import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi } from '@/core';


interface Payload{
  no_cache: boolean | string
}

export default class GetFriendList extends BaseAction<Payload, OB11User[]> {
  actionName = ActionName.GetFriendList;

  protected async _handle(payload: Payload) {
    if (friends.size === 0 || payload?.no_cache === true || payload?.no_cache === 'true') {
      const _friends = await NTQQFriendApi.getFriends(true);
      // log('强制刷新好友列表，结果: ', _friends)
      if (_friends.length > 0) {
        friends.clear();
        for (const friend of _friends) {
          friends.set(friend.uid, friend);
        }
      }
    }
    return OB11Constructor.friends(Array.from(friends.values()));
  }
}
