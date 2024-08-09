
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { OB11Constructor } from '@/onebot/helper/constructor';

export class GetFriendWithCategory extends BaseAction<void, any> {
  actionName = ActionName.GetFriendsWithCategory;

  protected async _handle(payload: void) {
    if (this.CoreContext.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
      //全新逻辑
      return OB11Constructor.friendsV2(await this.CoreContext.getApiContext().FriendApi.getBuddyV2ExWithCate(true));
    } else {
      throw new Error('this ntqq version not support, must be 26702 or later');
    }
  }
}
