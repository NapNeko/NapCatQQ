import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.coerce.string(),
    enable: z.coerce.boolean().optional(),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupWholeBan extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupWholeBan;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const enable = payload.enable?.toString() !== 'false';
        await this.core.apis.GroupApi.banGroup(payload.group_id.toString(), enable);
        return null;
    }
}
