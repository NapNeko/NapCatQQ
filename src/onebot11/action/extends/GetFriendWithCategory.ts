import { requireMinNTQQBuild } from '@/common/utils/QQBasicInfo';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { BuddyCategoryType } from '@/core/entities/';
import { NTQQFriendApi } from '@/core';
import { OB11Constructor } from '@/onebot11/constructor';

export class GetFriendWithCategory extends BaseAction<void, any> {
  actionName = ActionName.GetFriendsWithCategory;

  protected async _handle(payload: void) {
    if (requireMinNTQQBuild('26702')) {
      //全新逻辑
      return OB11Constructor.friendsV2(await NTQQFriendApi.getBuddyV2ExWithCate(true));
    } else {
      throw new Error('not support');
    }
  }
}
