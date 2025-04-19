import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.union([z.coerce.number(), z.coerce.string()]),
    user_id: z.union([z.coerce.number(), z.coerce.string()]),
    card: z.coerce.string().optional(),
});

type Payload = z.infer<typeof SchemaData>;

export default class SetGroupCard extends OneBotAction<Payload, null> {
    override actionName = ActionName.SetGroupCard;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload): Promise<null> {
        const member = await this.core.apis.GroupApi.getGroupMember(payload.group_id.toString(), payload.user_id.toString());
        if (member) await this.core.apis.GroupApi.setMemberCard(payload.group_id.toString(), member.uid, payload.card || '');
        return null;
    }
}
