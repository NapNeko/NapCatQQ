import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
const SchemaData = {
  type: 'object',
  properties: {
    rawData: { type: 'string' },
    brief: { type: 'string' }
  },
  required: ['brief', 'rawData'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class CreateCollection extends BaseAction<Payload, any> {
  actionName = ActionName.CreateCollection;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    return await this.CoreContext.getApiContext().CollectionApi.createCollection(
      this.CoreContext.selfInfo.uin,
      this.CoreContext.selfInfo.uid,
      this.CoreContext.selfInfo.nick,
      payload.brief, payload.rawData
    );
  }
}
