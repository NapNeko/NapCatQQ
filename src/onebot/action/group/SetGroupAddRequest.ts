import { OneBotAction } from '@/onebot/action/OneBotAction';
import { GroupNotify, NTGroupRequestOperateTypes } from '@/core/types';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    flag: Type.Union([Type.String(), Type.Number()]),
    approve: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
    reason: Type.Optional(Type.Union([Type.String({ default: ' ' }), Type.Null()])),
    count: Type.Optional(Type.Number({ default: 100 })),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupAddRequest extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupAddRequest;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const flag = payload.flag.toString();
        const approve = payload.approve?.toString() !== 'false';
        const reason = payload.reason ?? ' ';
        const count = payload.count;
        const invite_notify = this.obContext.apis.MsgApi.notifyGroupInvite.get(flag);
        const { doubt, notify } = invite_notify ? {
            doubt: false,
            notify: invite_notify,
        } : await this.findNotify(flag, count);
        if (!notify) {
            throw new Error('No such request');
        }
        await this.core.apis.GroupApi.handleGroupRequest(
            doubt,
            notify,
            approve ? NTGroupRequestOperateTypes.KAGREE : NTGroupRequestOperateTypes.KREFUSE,
            reason,
        );
        return null;
    }

    private async findNotify(flag: string, count: number = 100): Promise<{
        doubt: boolean,
        notify: GroupNotify | undefined
    }> {
        let notify = (await this.core.apis.GroupApi.getSingleScreenNotifies(false, count)).find(e => e.seq == flag);
        if (!notify) {
            notify = (await this.core.apis.GroupApi.getSingleScreenNotifies(true, count)).find(e => e.seq == flag);
            return { doubt: true, notify };
        }
        return { doubt: false, notify };
    }
}
