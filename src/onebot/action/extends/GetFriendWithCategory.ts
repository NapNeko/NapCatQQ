import { OB11Constructor } from '@/onebot/helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetFriendWithCategory extends BaseAction<void, any> {
    actionName = ActionName.GetFriendsWithCategory;

    async _handle(payload: void) {
        if (this.CoreContext.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
            //全新逻辑
            return OB11Constructor.friendsV2(await this.CoreContext.apis.FriendApi.getBuddyV2ExWithCate(true));
        } else {
            throw new Error('this ntqq version not support, must be 26702 or later');
        }
    }
}
