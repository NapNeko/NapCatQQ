import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { NTQQUserApi } from '@/core/apis';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';
const SchemaData = {
    type: 'object',
    properties: {
        user_id: {
            type: ['number', 'string']
        }
    },
    required: ['user_id'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetProfileLike extends BaseAction<Payload, any> {
    actionName = ActionName.GetProfileLike;
    PayloadSchema = SchemaData;
    protected async _handle(payload: Payload) {
        const ret = await NTQQUserApi.getProfileLike((await NTQQUserApi.getUidByUin(payload.user_id.toString()))!);
        return ret.info;
    }
}
