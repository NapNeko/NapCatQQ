import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { OB11GroupMemberSchema } from '../schemas';

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

  private parseBoolean (value: boolean | string): boolean {
    return typeof value === 'string' ? value === 'true' : value;
  }

  private async getUid (userId: string | number): Promise<string> {
    const uid = await this.core.apis.UserApi.getUidByUinV2(userId.toString());
    if (!uid) throw new Error(`Uin2Uid Error: 用户ID ${userId} 不存在`);
    return uid;
  }

  private async getGroupMemberInfo (payload: PayloadType, uid: string, isNocache: boolean) {
    const groupMemberCache = this.core.apis.GroupApi.groupMemberCache.get(payload.group_id.toString());
    const groupMember = groupMemberCache?.get(uid);

    const [member, info] = await Promise.all([
      this.core.apis.GroupApi.getGroupMemberEx(payload.group_id.toString(), uid, isNocache),
      this.core.apis.UserApi.getUserDetailInfo(uid, isNocache),
    ]);

    if (!member || !groupMember) throw new Error(`群(${payload.group_id})成员${payload.user_id}不存在`);

    return info ? { ...groupMember, ...member, ...info } : member;
  }

  async _handle (payload: PayloadType) {
    const isNocache = this.parseBoolean(payload.no_cache ?? true);
    const uid = await this.getUid(payload.user_id);
    const member = await this.getGroupMemberInfo(payload, uid, isNocache);

    if (!member) {
      this.core.context.logger.logDebug('获取群成员详细信息失败, 只能返回基础信息');
    }

    return OB11Construct.groupMember(payload.group_id.toString(), member);
  }
}

export default GetGroupMemberInfo;
