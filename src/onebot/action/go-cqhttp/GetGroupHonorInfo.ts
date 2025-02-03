import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { WebHonorType } from '@/core/types';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    type: Type.Optional(Type.Enum(WebHonorType))
});

type Payload = Static<typeof SchemaData>;

export class GetGroupHonorInfo extends OneBotAction<Payload, Array<unknown>> {
    override actionName = ActionName.GetGroupHonorInfo;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!payload.type) {
            payload.type = WebHonorType.ALL;
        }
        return await this.core.apis.WebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
    }
}
