import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    user_id: Type.Union([Type.Number(), Type.String()]),
    duration: Type.Union([Type.Number(), Type.String()], { default: 0 }),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupBan extends OneBotAction<Payload, null> {
    actionName = ActionName.SetGroupBan;
    payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('uid error');
        await this.core.apis.GroupApi.banMember(payload.group_id.toString(),
            [{ uid: uid, timeStamp: parseInt(payload.duration.toString()) }]);
        return null;
    }
}
