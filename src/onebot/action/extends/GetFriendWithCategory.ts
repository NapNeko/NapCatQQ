import { OB11Entities } from '@/onebot/entities';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';

export class GetFriendWithCategory extends BaseAction<void, any> {
    actionName = ActionName.GetFriendsWithCategory;

    async _handle(payload: void) {
        return (await this.core.apis.FriendApi.getBuddyV2ExWithCate(true)).map(category => ({
            ...category,
            buddyList: OB11Entities.friendsV2(category.buddyList),
        }));
    }
}
