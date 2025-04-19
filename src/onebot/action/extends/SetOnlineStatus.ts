import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    status: Type.Union([Type.Number(), Type.String()]),
    ext_status: Type.Union([Type.Number(), Type.String()]),
    battery_status: Type.Union([Type.Number(), Type.String()]),
});

type Payload = Static<typeof SchemaData>;

export class SetOnlineStatus extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetOnlineStatus;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const ret = await this.core.apis.UserApi.setSelfOnlineStatus(
            +payload.status,
            +payload.ext_status,
            +payload.battery_status,
        );
        if (ret.result !== 0) {
            throw new Error('设置在线状态失败');
        }
        return null;
    }
}
