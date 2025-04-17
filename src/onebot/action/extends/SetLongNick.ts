import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { actionType } from '@/common/coerce';
const SchemaData = z.object({
    longNick: actionType.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class SetLongNick extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.SetLongNick;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.UserApi.setLongNick(payload.longNick);
    }
}
