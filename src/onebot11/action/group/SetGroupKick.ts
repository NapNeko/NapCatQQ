import BaseAction from '../BaseAction';
import { getGroupMember } from '@/core/data';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQUserApi } from '@/core';


const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: [ 'number' , 'string' ] },
    user_id: { type: [ 'number' , 'string' ] },
    reject_add_request: { type: [ 'boolean' , 'string' ] }
  },
  required: ['group_id', 'user_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupKick extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupKick;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    const rejectReq = payload.reject_add_request?.toString() == 'true';
    await NTQQGroupApi.kickMember(payload.group_id.toString(), [(await NTQQUserApi.getUidByUin(payload.user_id.toString()))!], rejectReq);
    return null;
  }
}
