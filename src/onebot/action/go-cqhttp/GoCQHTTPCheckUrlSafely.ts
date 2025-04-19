import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    url: Type.String(),
});

type Payload = Static<typeof SchemaData>;

export class GoCQHTTPCheckUrlSafely extends OneBotAction<Payload, { level: number }> {
    override actionName = ActionName.GoCQHTTP_CheckUrlSafely;
    override payloadSchema = SchemaData;

    async _handle() {
        return { level: 1 };
    }
}
