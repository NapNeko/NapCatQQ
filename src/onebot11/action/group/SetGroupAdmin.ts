import BaseAction from '../BaseAction';
import { getGroupMember } from '@/core/data';
import { GroupMemberRole } from '@/core/entities';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: 'number' },
    user_id: { type: 'number' },
    enable: { type: 'boolean' }
  },
  required: ['group_id', 'user_id', 'enable']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupAdmin extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupAdmin;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    const member = await getGroupMember(payload.group_id, payload.user_id);
    // 已经前置验证类型
    const enable = payload.enable.toString() === 'true';
    if (!member) {
      throw `群成员${payload.user_id}不存在`;
    }
    await NTQQGroupApi.setMemberRole(payload.group_id.toString(), member.uid, enable ? GroupMemberRole.admin : GroupMemberRole.normal);
    return null;
  }
}
