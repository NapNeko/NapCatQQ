import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { rawFriends, friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { BuddyCategoryType } from '@/core/entities/';

export class GetFriendWithCategory extends BaseAction<void, Array<BuddyCategoryType>> {
  actionName = ActionName.GetFriendsWithCategory;

  protected async _handle(payload: void) {
    return rawFriends;
  }
}
