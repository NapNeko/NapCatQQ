import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { GroupMember } from 'napcat-core';
import { GroupActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否不使用缓存' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Any(), { description: '群成员列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupMemberList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupMemberList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群成员列表';
  override actionDescription = '获取群聊中的所有成员列表';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.GetGroupMemberList.payload;
  override returnExample = GroupActionsExamples.GetGroupMemberList.response;

  async _handle (payload: PayloadType) {
    const groupIdStr = payload.group_id.toString();
    const noCache = this.parseBoolean(payload.no_cache ?? false);
    const groupMembers = await this.getGroupMembers(groupIdStr, noCache);
    const _groupMembers = await Promise.all(
      Array.from(groupMembers.values()).map(item =>
        OB11Construct.groupMember(groupIdStr, item)
      )
    );
    return Array.from(new Map(_groupMembers.map(member => [member.user_id, member])).values());
  }

  private parseBoolean (value: boolean | string): boolean {
    return typeof value === 'string' ? value === 'true' : value;
  }

  private async getGroupMembers (groupIdStr: string, noCache: boolean): Promise<Map<string, GroupMember>> {
    const memberCache = this.core.apis.GroupApi.groupMemberCache;
    let groupMembers = memberCache.get(groupIdStr);

    if (noCache || !groupMembers) {
      const data = this.core.apis.GroupApi.refreshGroupMemberCache(groupIdStr, true).then().catch();
      groupMembers = memberCache.get(groupIdStr) || (await data);
      if (!groupMembers) {
        throw new Error(`Failed to get group member list for group ${groupIdStr}`);
      }
    }

    return groupMembers;
  }
}
