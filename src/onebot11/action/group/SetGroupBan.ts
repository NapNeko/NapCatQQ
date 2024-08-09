import BaseAction from '../BaseAction';
import { getGroupMember } from '@/core/data';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { NTQQUserApi } from '@/core';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: ['number', 'string'] },
    user_id: { type: ['number', 'string'] },
    duration: { type: ['number', 'string'] }
  },
  required: ['group_id', 'user_id', 'duration']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupBan extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupBan;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    await NTQQGroupApi.banMember(payload.group_id.toString(),
      [{ uid: (await NTQQUserApi.getUidByUin(payload.user_id.toString()))!, timeStamp: parseInt(payload.duration.toString()) }]);
    return null;
  }
}
