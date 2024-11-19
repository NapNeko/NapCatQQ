import { OB11Entities } from '@/onebot/entities';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '../types';

export class GetFriendWithCategory extends OneBotAction<void, any> {
    actionName = ActionName.GetFriendsWithCategory;

    async _handle(payload: void) {
        return (await this.core.apis.FriendApi.getBuddyV2ExWithCate()).map(category => ({
            ...category,
            buddyList: OB11Entities.friendsV2(category.buddyList),
        }));
    }
}
