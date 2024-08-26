import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// 设置在线状态

const SchemaData = {
    type: 'object',
    properties: {
        status: { type: ['number', 'string'] },
        extStatus: { type: ['number', 'string'] },
        batteryStatus: { type: ['number', 'string'] },
    },
    required: ['status', 'extStatus', 'batteryStatus'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetOnlineStatus extends BaseAction<Payload, null> {
    actionName = ActionName.SetOnlineStatus;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQUserApi = this.core.apis.UserApi;
        const ret = await NTQQUserApi.setSelfOnlineStatus(
            parseInt(payload.status.toString()),
            parseInt(payload.extStatus.toString()),
            parseInt(payload.batteryStatus.toString()),
        );
        if (ret.result !== 0) {
            throw new Error('设置在线状态失败');
        }
        return null;
    }
}
