
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { WebApi, WebHonorType } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: ['number', 'string'] },
    type: { enum: [WebHonorType.ALL, WebHonorType.EMOTION, WebHonorType.LEGEND, WebHonorType.PERFROMER, WebHonorType.STORONGE_NEWBI, WebHonorType.TALKACTIVE] }
  },
  required: ['group_id']
} as const satisfies JSONSchema;
// enum是不是有点抽象
type Payload = FromSchema<typeof SchemaData>;

export class GetGroupHonorInfo extends BaseAction<Payload, Array<any>> {
  actionName = ActionName.GetGroupHonorInfo;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    if (!payload.type) {
      payload.type = WebHonorType.ALL;
    }
    return await WebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
  }
}
