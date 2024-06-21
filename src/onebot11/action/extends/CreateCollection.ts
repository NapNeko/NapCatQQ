
import { NTQQCollectionApi } from '@/core/apis/collection';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import { selfInfo } from '@/core/data';

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
    return await NTQQCollectionApi.createCollection(selfInfo.uin, selfInfo.uid, selfInfo.nick, payload.brief, payload.rawData);
  }
}
