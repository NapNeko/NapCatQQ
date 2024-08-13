import { GroupEssenceMsgRet } from '@/core';
import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        pages: { type: 'number' },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetGroupEssence extends BaseAction<Payload, GroupEssenceMsgRet> {
    actionName = ActionName.GoCQHTTP_GetEssenceMsg;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQWebApi = this.CoreContext.apis.WebApi;
        const ret = await NTQQWebApi.getGroupEssenceMsg(payload.group_id.toString(), (payload.pages || "0").toString());
        if (!ret) {
            throw new Error('获取失败');
        }
        return ret;
    }
}
