import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    flag: Type.String(),
    approve: Type.Optional(Type.Union([Type.String(), Type.Boolean()])),
    remark: Type.Optional(Type.String())
});

type Payload = Static<typeof SchemaData>;

export default class SetFriendAddRequest extends OneBotAction<Payload, null> {
    actionName = ActionName.SetFriendAddRequest;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const approve = payload.approve?.toString() !== 'false';
        await this.core.apis.FriendApi.handleFriendRequest(payload.flag, approve);
        if (payload.remark) {
            const data = payload.flag.split('|');
            if (data.length < 2) {
                throw new Error('Invalid flag');
            }
            const friendUid = data[0];
            await this.core.apis.FriendApi.setBuddyRemark(friendUid, payload.remark);
        }
        return null;
    }
}
