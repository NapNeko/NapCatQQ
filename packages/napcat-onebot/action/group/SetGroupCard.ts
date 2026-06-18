import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { sleep } from '@/napcat-common/src/helper';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.String({ description: '用户QQ' }),
  card: Type.Optional(Type.String({ description: '群名片' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupCard extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupCard;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置群名片';
  override actionDescription = '设置群聊中指定成员的群名片';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupCard.payload;
  override returnExample = GroupActionsExamples.SetGroupCard.response;

  async _handle (payload: PayloadType): Promise<null> {
    const groupId = payload.group_id.toString();
    const userId = payload.user_id.toString();
    const card = payload.card || '';

    const member = await this.core.apis.GroupApi.getGroupMember(groupId, userId);
    if (!member) {
      throw new Error(`群(${groupId})成员${userId}不存在`);
    }

    await this.core.apis.GroupApi.setMemberCard(groupId, member.uid, card);

    for (let i = 0; i < 3; i++) {
      await sleep(1000);
      const updatedMember = await this.core.apis.GroupApi.refreshGroupMemberCachePartial(groupId, member.uid);
      if (updatedMember?.cardName === card) {
        return null;
      }
    }
    throw new Error('设置群名片未生效');
  }
}
