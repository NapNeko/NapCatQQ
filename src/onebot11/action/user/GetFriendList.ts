import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi } from '@/core';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';


// no_cache get时传字符串
const SchemaData = {
  type: 'object',
  properties: {
    no_cache: { type: ['boolean', 'string'] },
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class GetFriendList extends BaseAction<Payload, OB11User[]> {
  actionName = ActionName.GetFriendList;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    return OB11Constructor.friends(await NTQQFriendApi.getFriends(payload?.no_cache?.toString() === 'true'));
  }
}
