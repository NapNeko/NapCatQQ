import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';


class GetFriendList extends BaseAction<null, OB11User[]> {
  actionName = ActionName.GetFriendList;

  protected async _handle(payload: null) {
    return OB11Constructor.friends(Array.from(friends.values()));
  }
}

export default GetFriendList;
