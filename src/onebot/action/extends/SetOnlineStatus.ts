import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { coerce } from '@/common/coerce';
const SchemaData = z.object({
    status: coerce.number(),
    ext_status: coerce.number(),
    battery_status: coerce.number(),
});

type Payload = z.infer<typeof SchemaData>;

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
