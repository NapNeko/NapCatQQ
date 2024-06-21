
import { NTQQCollectionApi } from '@/core/apis/collection';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { selfInfo } from '@/core/data';

const SchemaData = {
  type: 'object',
  properties: {
    category: { type: 'number' },
    count: { type: 'number' }
  },
  required: ['category', 'count'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetCollectionList extends BaseAction<Payload, any> {
  actionName = ActionName.GetCollectionList;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    return await NTQQCollectionApi.getAllCollection(payload.category, payload.count);
  }
}
