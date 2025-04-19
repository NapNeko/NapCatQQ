import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.number(), z.string()]),
    is_dismiss: z.boolean().optional(),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupLeave extends OneBotAction<Payload, void> {
    override actionName = ActionName.SetGroupLeave;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<void> {
        await this.core.apis.GroupApi.quitGroup(payload.group_id.toString());
    }
}
