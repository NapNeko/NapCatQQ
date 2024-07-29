import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis';
const SchemaData = {
  type: 'object',
  properties: {
    count: { type: 'number' },
  }
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class FetchCustomFace extends BaseAction<Payload, any> {
  actionName = ActionName.FetchCustomFace;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    return await NTQQMsgApi.fetchFavEmojiList(payload.count || 48);
  }
}
