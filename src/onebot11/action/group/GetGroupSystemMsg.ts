import { NTQQGroupApi } from '@/core';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQMsgApi } from '@/core/apis/msg';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    group_id: { type: 'number' }
  },
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupSystemMsg extends BaseAction<void, any> {
  actionName = ActionName.GetGroupSystemMsg;
  protected async _handle(payload: void) {
    // 默认10条 该api未完整实现 包括响应数据规范化 类型规范化 
    return await NTQQGroupApi.getSingleScreenNotifies(10);
  }
}
