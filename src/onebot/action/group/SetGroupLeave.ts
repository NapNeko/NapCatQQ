import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    is_dismiss: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupLeave extends OneBotAction<Payload, void> {
    override actionName = ActionName.SetGroupLeave;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<void> {
        await this.core.apis.GroupApi.quitGroup(payload.group_id.toString());
    }
}
