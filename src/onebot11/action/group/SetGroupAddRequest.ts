import BaseAction from '../BaseAction';
import { GroupRequestOperateTypes } from '@/core/entities';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { groupNotifies } from '@/core/data';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    flag: { type: 'string' },
    approve: { type: 'boolean' },
    reason: { type: 'string' }
  },
  required: ['flag', 'approve', 'reason']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupAddRequest extends BaseAction<Payload, null> {
  actionName = ActionName.SetGroupAddRequest;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    const flag = payload.flag.toString();
    const approve = payload.approve.toString() === 'true';
    const notify = groupNotifies[flag];
    if (!notify) {
      throw `${flag}对应的加群通知不存在`;
    }
    await NTQQGroupApi.handleGroupRequest(notify,
      approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
      payload.reason
    );
    return null;
  }
}
