import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { z } from 'zod';

const SchemaData = z.object({
    group_id: z.coerce.string(),
    user_id: z.coerce.string(),
    special_title: z.coerce.string().default(''),
});

type Payload = z.infer<typeof SchemaData>;

export class SetSpecialTitle extends GetPacketStatusDepends<Payload, void> {
    override actionName = ActionName.SetSpecialTitle;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('User not found');
        await this.core.apis.PacketApi.pkt.operation.SetGroupSpecialTitle(+payload.group_id, uid, payload.special_title);
    }
}
