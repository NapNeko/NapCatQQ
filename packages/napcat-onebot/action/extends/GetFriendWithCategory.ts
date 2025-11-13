import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';

export class GetFriendWithCategory extends OneBotAction<void, unknown> {
  override actionName = ActionName.GetFriendsWithCategory;

  async _handle () {
    return (await this.core.apis.FriendApi.getBuddyV2ExWithCate()).map(category => ({
      ...category,
      buddyList: OB11Construct.friends(category.buddyList),
    }));
  }
}
