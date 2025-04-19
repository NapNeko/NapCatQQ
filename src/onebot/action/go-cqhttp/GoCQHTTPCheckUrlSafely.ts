import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    url: z.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class GoCQHTTPCheckUrlSafely extends OneBotAction<Payload, { level: number }> {
    override actionName = ActionName.GoCQHTTP_CheckUrlSafely;
    override payloadSchema = SchemaData;

    async _handle() {
        return { level: 1 };
    }
}
