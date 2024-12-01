import { OneBotAction } from '@/onebot/action/OneBotAction';
import { NTGroupRequestOperateTypes } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    flag: Type.String(),
    approve: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
    reason: Type.Union([Type.String({ default: ' ' }), Type.Null()]),
});

type Payload = Static<typeof SchemaData>;

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
