import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
// 设置在线状态

const SchemaData = {
    type: 'object',
    properties: {
        status: { type: ['number', 'string'] },
        ext_status: { type: ['number', 'string'] },
        battery_status: { type: ['number', 'string'] },
    },
    required: ['status', 'ext_status', 'battery_status'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class SetOnlineStatus extends BaseAction<Payload, null> {
    actionName = ActionName.SetOnlineStatus;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.UserApi.setSelfOnlineStatus(
            parseInt(payload.status.toString()),
            parseInt(payload.ext_status.toString()),
            parseInt(payload.battery_status.toString()),
        );
        if (ret.result !== 0) {
            throw new Error('设置在线状态失败');
        }
        return null;
    }
}
