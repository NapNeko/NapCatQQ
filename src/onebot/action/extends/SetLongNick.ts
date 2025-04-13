import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    longNick: z.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class SetLongNick extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.SetLongNick;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.UserApi.setLongNick(payload.longNick);
    }
}
