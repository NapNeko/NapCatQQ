import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

const SchemaData = Type.Object({
    rawData: Type.String(),
    brief: Type.String(),
});

type Payload = Static<typeof SchemaData>;

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