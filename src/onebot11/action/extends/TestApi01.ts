import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';
import { napCatCore, NTQQGroupApi } from '@/core';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
  type: 'object',
  properties: {
    cmd: { type: 'string' },
    param: { type: 'string' }
  },
  required: ['cmd', 'param'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class TestApi01 extends BaseAction<Payload, any> {
  actionName = ActionName.TestApi01;
  // 用不着复杂检测
  protected async check(payload: Payload): Promise<BaseCheckResult> {
    return { valid: true };
  }
  protected async _handle(payload: Payload): Promise<any> {
    return await napCatCore.session.getMsgService().sendSsoCmdReqByContend(payload.cmd, payload.param);
  }
}
