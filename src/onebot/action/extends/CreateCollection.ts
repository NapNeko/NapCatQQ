import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    rawData: z.string(),
    brief: z.string(),
});

type Payload = z.infer<typeof SchemaData>;

export class CreateCollection extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.CreateCollection;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.CollectionApi.createCollection(
            this.core.selfInfo.uin,
            this.core.selfInfo.uid,
            this.core.selfInfo.nick,
            payload.brief, payload.rawData,
        );
    }
}