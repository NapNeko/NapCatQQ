import { type NTQQCollectionApi } from '@/core/apis/collection';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    category: z.coerce.number(),
    count: z.coerce.number().default(1),
});

type Payload = z.infer<typeof SchemaData>;

export class GetCollectionList extends OneBotAction<Payload, Awaited<ReturnType<NTQQCollectionApi['getAllCollection']>>> {
    override actionName = ActionName.GetCollectionList;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.CollectionApi.getAllCollection(+payload.category, +payload.count);
    }
}
