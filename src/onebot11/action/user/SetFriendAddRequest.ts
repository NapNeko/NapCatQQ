import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQFriendApi } from '@/core/apis/friend';
import { friendRequests } from '@/core/data';

const SchemaData = {
  type: 'object',
  properties: {
    flag: { type: 'string' },
    approve: { type: ['string', 'boolean'] },
    remark: { type: 'string' }
  },
  required: ['flag', 'approve']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetFriendAddRequest extends BaseAction<Payload, null> {
  actionName = ActionName.SetFriendAddRequest;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    const approve = payload.approve.toString() === 'true';
    const request = friendRequests[payload.flag];
    await NTQQFriendApi.handleFriendRequest(request, approve);
    return null;
  }
}
