import { NTQQUserApi } from '@/core/apis';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    user_id: { type: ['number', 'string'] },
    times: { type: ['number', 'string'] }
  },
  required: ['user_id', 'times']
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;
export default class SendLike extends BaseAction<Payload, null> {
  actionName = ActionName.SendLike;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload): Promise<null> {
    //logDebug('点赞参数', payload);
    try {
      const qq = payload.user_id.toString();
      const uid: string = await NTQQUserApi.getUidByUin(qq) || '';
      const result = await NTQQUserApi.like(uid, parseInt(payload.times?.toString()) || 1);
      //logDebug('点赞结果', result);
      if (result.result !== 0) {
        throw Error(result.errMsg);
      }
    } catch (e) {
      throw `点赞失败 ${e}`;
    }
    return null;
  }
}
