import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

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
    const NTQQGroupApi = this.CoreContext.getApiContext().GroupApi;
    await NTQQGroupApi.banMember(payload.group_id.toString(),
      [{ uid: member.uid, timeStamp: parseInt(payload.duration.toString()) }]);
    return null;
  }
}
