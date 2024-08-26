import { WebApiGroupInfoAll } from '@/core';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

class GetGroupInfoAll extends BaseAction<Payload, WebApiGroupInfoAll> {
    actionName = ActionName.GetGroupInfoAll;
    payloadSchema = SchemaData;
    async _handle(payload: Payload) {
        const NTQQWebApi = this.core.apis.WebApi;
        const ret = await NTQQWebApi.getGroupInfoAll(payload.group_id.toString());
        if (!ret) {
            throw new Error('获取失败');
        }
        return ret;
    }
}

export default GetGroupInfoAll;
