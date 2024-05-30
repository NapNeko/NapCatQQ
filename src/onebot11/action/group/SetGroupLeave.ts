import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQGroupApi } from '@/core/apis/group';
import { log, logError } from '@/common/utils/log';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: [ 'number' , 'string' ] },
    is_dismiss: { type: 'boolean' }
  },
  required: ['group_id']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class SetGroupLeave extends BaseAction<Payload, any> {
  actionName = ActionName.SetGroupLeave;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<any> {
    try {
      await NTQQGroupApi.quitGroup(payload.group_id.toString());
    } catch (e) {
      logError('退群失败', e);
      throw e;
    }
  }
}
