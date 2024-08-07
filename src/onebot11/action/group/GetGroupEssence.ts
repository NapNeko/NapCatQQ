import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { GroupEssenceMsgRet, WebApi } from '@/core/apis/webapi';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: [ 'number' , 'string' ] },
    pages: { type: 'number' },
  },
  required: ['group_id', 'pages']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupEssence extends BaseAction<Payload, GroupEssenceMsgRet> {
  actionName = ActionName.GoCQHTTP_GetEssenceMsg;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    const ret = await WebApi.getGroupEssenceMsg(payload.group_id.toString(), payload.pages.toString());
    if (!ret) {
      throw new Error('获取失败');
    }
    return ret;
  }
}
