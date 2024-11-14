import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        user_id: { type: ['number', 'string'] },
        times: { type: ['number', 'string'] },
    },
    required: ['user_id', 'times'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SendLike extends BaseAction<Payload, null> {
    actionName = ActionName.SendLike;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const qq = payload.user_id.toString();
        const uid: string = await this.core.apis.UserApi.getUidByUinV2(qq) ?? '';
        const result = await this.core.apis.UserApi.like(uid, parseInt(payload.times?.toString()) || 1);
        if (result.result !== 0) {
            throw new Error(`点赞失败 ${result.errMsg}`);
        }
        return null;
    }
}
