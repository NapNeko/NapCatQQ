import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetFriendWithCategory extends OneBotAction<void, any> {
    actionName = ActionName.GetFriendsWithCategory;

    async _handle(payload: void) {
        return (await this.core.apis.FriendApi.getBuddyV2ExWithCate()).map(category => ({
            ...category,
            buddyList: OB11Construct.friends(category.buddyList),
        }));
    }
}
