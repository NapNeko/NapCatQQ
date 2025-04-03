import { ActionName } from '@/onebot/action/router';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    group_id: Type.Union([Type.Number(), Type.String()]),
    user_id: Type.Union([Type.Number(), Type.String()]),
    special_title: Type.String({ default: '' }),
});

type Payload = Static<typeof SchemaData>;

export class SetSpecialTitle extends GetPacketStatusDepends<Payload, void> {
    override actionName = ActionName.SetSpecialTitle;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
        if (!uid) throw new Error('User not found');
        await this.core.apis.PacketApi.pkt.operation.SetGroupSpecialTitle(+payload.group_id, uid, payload.special_title);
    }
}
