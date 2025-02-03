import { OB11Construct } from '@/onebot/helper/data';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';

export class GetFriendWithCategory extends OneBotAction<void, unknown> {
    override actionName = ActionName.GetFriendsWithCategory;

    async _handle() {
        return (await this.core.apis.FriendApi.getBuddyV2ExWithCate()).map(category => ({
            ...category,
            buddyList: OB11Construct.friends(category.buddyList),
        }));
    }
}
