import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { WebHonorType } from '@/core/entities';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        group_id: { type: ['number', 'string'] },
        type: { enum: [WebHonorType.ALL, WebHonorType.EMOTION, WebHonorType.LEGEND, WebHonorType.PERFORMER, WebHonorType.STRONG_NEWBIE, WebHonorType.TALKATIVE] },
    },
    required: ['group_id'],
} as const satisfies JSONSchema;
// enum是不是有点抽象
type Payload = FromSchema<typeof SchemaData>;

export class GetGroupHonorInfo extends BaseAction<Payload, Array<any>> {
    actionName = ActionName.GetGroupHonorInfo;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!payload.type) {
            payload.type = WebHonorType.ALL;
        }
        const NTQQWebApi = this.CoreContext.getApiContext().WebApi;
        return await NTQQWebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
    }
}
