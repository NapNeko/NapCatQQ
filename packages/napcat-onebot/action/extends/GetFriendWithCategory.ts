import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';
import { OB11UserSchema } from '../schemas';

const ReturnSchema = Type.Array(
  Type.Object({
    categoryId: Type.Number({ description: '分组ID' }),
    categoryName: Type.String({ description: '分组名称' }),
    categoryMbCount: Type.Number({ description: '分组内好友数量' }),
    buddyList: Type.Array(OB11UserSchema, { description: '好友列表' }),
  }),
  { description: '带分组的好友列表' }
);

type ReturnType = Static<typeof ReturnSchema>;

export class GetFriendWithCategory extends OneBotAction<void, ReturnType> {
  override actionName = ActionName.GetFriendsWithCategory;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;
  override actionSummary = '获取带分组的好友列表';
  override actionTags = ['用户扩展'];
  override payloadExample = {};
  override returnExample = [
    {
      categoryId: 1,
      categoryName: '我的好友',
      categoryMbCount: 1,
      buddyList: []
    }
  ];

  async _handle () {
    const categories = await this.core.apis.FriendApi.getBuddyV2ExWithCate();
    return categories.map(category => ({
      ...category,
      buddyList: OB11Construct.friends(category.buddyList),
    }));
  }
}
