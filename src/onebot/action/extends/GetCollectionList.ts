import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const SchemaData = Type.Object({
    category: Type.Union([Type.Number(), Type.String()]),
    count: Type.Union([Type.Union([Type.Number(), Type.String()])], { default: 1 }),
});

type Payload = Static<typeof SchemaData>;

export class GetCollectionList extends OneBotAction<Payload, any> {
    actionName = ActionName.GetCollectionList;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        return await this.core.apis.CollectionApi.getAllCollection(parseInt(payload.category.toString()), +payload.count);
    }
}
