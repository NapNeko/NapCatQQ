import { OB11User } from '../../types';
import { OB11Constructor } from '../../constructor';
import { friends } from '@/core/data';
import BaseAction from '../BaseAction';
import { ActionName, BaseCheckResult } from '../types';
import { NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
import Ajv from 'ajv';
// 设置在线状态

const SchemaData = {
  type: 'object',
  properties: {
    status: { type: 'number' },
    extStatus: { type: 'number' },
    batteryStatus: { type: 'number' }
  },
  required: ['status', 'extStatus', 'batteryStatus'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetOnlineStatus extends BaseAction<Payload, null> {
  actionName = ActionName.SetOnlineStatus;
  PayloadSchema = SchemaData;
  protected async _handle(payload: Payload) {
    // 可设置状态
    // { status: 10, extStatus: 1027, batteryStatus: 0 }
    // { status: 30, extStatus: 0, batteryStatus: 0 }
    // { status: 50, extStatus: 0, batteryStatus: 0 }
    // { status: 60, extStatus: 0, batteryStatus: 0 }
    // { status: 70, extStatus: 0, batteryStatus: 0 }
    const ret = await NTQQUserApi.setSelfOnlineStatus(payload.status, payload.extStatus, payload.batteryStatus);
    if (ret.result !== 0) {
      throw new Error('设置在线状态失败');
    }
    return null;
  }
}
