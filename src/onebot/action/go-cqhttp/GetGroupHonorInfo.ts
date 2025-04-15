import { WebHonorType } from '@/core';
import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.coerce.string(),
    type: z.nativeEnum(WebHonorType).optional()
});

type Payload = z.infer<typeof SchemaData>;

export class GetGroupHonorInfo extends OneBotAction<Payload, unknown> {
    override actionName = ActionName.GetGroupHonorInfo;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        if (!payload.type) {
            payload.type = WebHonorType.ALL;
        }
        return await this.core.apis.WebApi.getGroupHonorInfo(payload.group_id.toString(), payload.type);
    }
}
