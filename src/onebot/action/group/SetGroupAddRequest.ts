import { OneBotAction } from '@/onebot/action/OneBotAction';
import { NTGroupRequestOperateTypes } from '@/core/entities';
import { ActionName } from '@/onebot/action/router';
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

export default class SetGroupAddRequest extends OneBotAction<Payload, null> {
    actionName = ActionName.SetGroupAddRequest;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const flag = payload.flag.toString();
        const approve = payload.approve?.toString() !== 'false';
        await this.core.apis.GroupApi.handleGroupRequest(flag,
            approve ? NTGroupRequestOperateTypes.KAGREE : NTGroupRequestOperateTypes.KREFUSE,
            payload.reason ?? ' ',
        );
        return null;
    }
}
