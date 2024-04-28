import BaseAction from '../BaseAction';
import { getGroupMember } from '@/core/data';
import { GroupMemberRole } from '@/core/entities';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';

interface Payload {
  group_id: number,
  user_id: number,
  enable: boolean
}

export default class SetGroupAdmin extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupAdmin;

  protected async _handle(payload: Payload): Promise<null> {
    const member = await getGroupMember(payload.group_id, payload.user_id);
    const enable = payload.enable.toString() === 'true';
    if (!member) {
      throw `群成员${payload.user_id}不存在`;
    }
    await NTQQGroupApi.setMemberRole(payload.group_id.toString(), member.uid, enable ? GroupMemberRole.admin : GroupMemberRole.normal);
    return null;
  }
}
