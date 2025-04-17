import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';
import { coerce } from '@/common/coerce';
const SchemaData = z.object({
    group_id: coerce.string(),
    user_id: coerce.string(),
    card: coerce.string().optional(),
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
