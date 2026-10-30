import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { OB11GroupMemberSchema } from '../schemas';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.String({ description: 'QQ号' }),
  no_cache: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否不使用缓存' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = OB11GroupMemberSchema;

type ReturnType = Static<typeof ReturnSchema>;

class GetGroupMemberInfo extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupMemberInfo;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群成员信息';
  override actionDescription = '获取群聊中指定成员的信息';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.GetGroupMemberInfo.payload;
  override returnExample = GroupActionsExamples.GetGroupMemberInfo.response;

  private parseBoolean (value: boolean | string): boolean {
    return typeof value === 'string' ? value === 'true' : value;
  }

  private async getUid (userId: string | number): Promise<string> {
    const uid = await this.core.apis.UserApi.getUidByUinV2(userId.toString());
    if (!uid) throw new Error(`Uin2Uid Error: 用户ID ${userId} 不存在`);
    return uid;
  }

  private async getGroupMemberInfo (payload: PayloadType, isNocache: boolean) {
    const groupId = payload.group_id.toString();
    // 全局 UIN -> UID 转换可能与目标群的成员记录不一致，优先按 QQ 号在本群查询。
    // getGroupMember 会在缓存未命中时刷新一次，避免冷缓存被误判为成员不存在。
    const groupMember = await this.core.apis.GroupApi.getGroupMember(groupId, payload.user_id);
    const uid = groupMember?.uid || await this.getUid(payload.user_id);

    const [member, info] = await Promise.all([
      this.core.apis.GroupApi.getGroupMemberEx(groupId, uid, isNocache),
      this.core.apis.UserApi.getUserDetailInfo(uid, isNocache).catch((error) => {
        this.core.context.logger.logDebug(`获取群成员补充资料失败, 群号: ${groupId}, QQ号: ${payload.user_id}, 错误: ${error}`);
        return undefined;
      }),
    ]);

    const baseMember = member ?? groupMember;
    if (!baseMember) throw new Error(`群(${payload.group_id})成员${payload.user_id}不存在`);

    // 个人资料只补充信息，不能覆盖已确认的群成员身份。
    return { ...groupMember, ...baseMember, ...info, uid: baseMember.uid, uin: baseMember.uin };
  }

  async _handle (payload: PayloadType) {
    const isNocache = this.parseBoolean(payload.no_cache ?? true);
    const member = await this.getGroupMemberInfo(payload, isNocache);

    return OB11Construct.groupMember(payload.group_id.toString(), member);
  }
}

export default GetGroupMemberInfo;
