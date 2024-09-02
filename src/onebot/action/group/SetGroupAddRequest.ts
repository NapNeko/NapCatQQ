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
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const flag = payload.flag.toString();
        const approve = payload.approve?.toString() !== 'false';
        await this.core.apis.GroupApi.handleGroupRequest(flag,
            approve ? GroupRequestOperateTypes.approve : GroupRequestOperateTypes.reject,
            payload.reason ?? ' ',
        );
        return null;
    }
}
