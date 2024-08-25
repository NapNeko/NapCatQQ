import BaseAction from '../BaseAction';
import { GroupRequestOperateTypes } from '@/core/entities';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

const SchemaData = {
    type: 'object',
    properties: {
        flag: { type: 'string' },
        approve: { type: ['string', 'boolean'] },
        reason: { type: 'string', nullable: true },
    },
    required: ['flag'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export default class SetGroupAddRequest extends BaseAction<Payload, null> {
    actionName = ActionName.SetGroupAddRequest;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const NTQQGroupApi = this.CoreContext.apis.GroupApi;
        const flag = payload.flag.toString();
        const approve = payload.approve?.toString() !== 'false';
        await NTQQGroupApi.handleGroupRequest(flag,
            approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
            payload.reason ?? ' ',
        );
        return null;
    }
}
