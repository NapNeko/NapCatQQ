import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    enable: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupWholeBan extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupWholeBan;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const enable = payload.enable?.toString() !== 'false';
        let res = await this.core.apis.GroupApi.banGroup(payload.group_id.toString(), enable);
        if (res.result !== 0) {
            throw new Error(`SetGroupWholeBan failed: ${res.errMsg} ${res.result}`);
        }
        return null;
    }
}
