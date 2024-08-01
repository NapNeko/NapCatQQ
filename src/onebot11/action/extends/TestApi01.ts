import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';
import * as fs from 'node:fs';
import { NTQQUserApi } from '@/core/apis/user';
import { checkFileReceived, uri2local } from '@/common/utils/file';
import { napCatCore, NTQQGroupApi } from '@/core';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// import { log } from "../../../common/utils";

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
    return {
      valid: true,
    };
  }
  protected async _handle(payload: Payload): Promise<any> {
    return await napCatCore.session.getMsgService().sendSsoCmdReqByContend(payload.cmd, payload.param);
  }
}
