import BaseAction from '../BaseAction';
import { GroupMemberRole } from '@/core/entities';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: [ 'number' , 'string' ] },
    user_id: { type: [ 'number' , 'string' ] },
    enable: { type: 'boolean' }
  },
  required: ['group_id', 'user_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupAdmin extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupAdmin;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
    await NTQQGroupApi.setMemberRole(payload.group_id.toString(), member.uid, enable ? GroupMemberRole.admin : GroupMemberRole.normal);
    return null;
  }
}
