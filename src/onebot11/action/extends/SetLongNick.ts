import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    longNick: { type: 'string' },
  },
  required: [ 'longNick'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetLongNick extends BaseAction<Payload, any> {
  actionName = ActionName.SetLongNick;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const ret = await NTQQUserApi.setLongNick(payload.longNick);
    return ret;
  }
}
