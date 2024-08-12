import { OB11Constructor } from '@/onebot/helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetFriendWithCategory extends BaseAction<void, any> {
    actionName = ActionName.GetFriendsWithCategory;

    async _handle(payload: void) {
        if (this.CoreContext.context.basicInfoWrapper.requireMinNTQQBuild('26702')) {
            //全新逻辑
            return (await this.CoreContext.apis.FriendApi.getBuddyV2ExWithCate(true)).map(category => ({
                ...category,
                buddyList: OB11Constructor.friendsV2(category.buddyList),
            }));
        } else {
            throw new Error('this ntqq version not support, must be 26702 or later');
        }
    }
}
