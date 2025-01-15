import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    longNick: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class SetLongNick extends OneBotAction<Payload, any> {
    actionName = ActionName.SetLongNick;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.UserApi.setLongNick(payload.longNick);
    }
}
