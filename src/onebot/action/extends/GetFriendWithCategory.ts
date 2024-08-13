import { OB11Constructor } from '@/onebot/helper/data';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetFriendWithCategory extends BaseAction<void, any> {
    actionName = ActionName.GetFriendsWithCategory;

    async _handle(payload: void) {
        return (await this.CoreContext.apis.FriendApi.getBuddyV2ExWithCate(true)).map(category => ({
            ...category,
            buddyList: OB11Constructor.friendsV2(category.buddyList),
        }));
    }
}
