import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
    cmd: Type.String(),
    data: Type.String(),
    rsp: Type.Union([Type.String(), Type.Boolean()], { default: true }),
});

type Payload = Static<typeof SchemaData>;

export class SendPacket extends GetPacketStatusDepends<Payload, any> {
    payloadSchema = SchemaData;
    actionName = ActionName.SendPacket;
    async _handle(payload: Payload) {
        const rsp = typeof payload.rsp === 'boolean' ? payload.rsp : payload.rsp === 'true';
        const data = await this.core.apis.PacketApi.pkt.operation.sendPacket({ cmd: payload.cmd, data: payload.data as any }, rsp);
        return typeof data === 'object' ? data.toString('hex') : undefined;
    }
}
