import { PacketHexStr } from '@/core/packet/transformer/base';
import { GetPacketStatusDepends } from '@/onebot/action/packet/GetPacketStatus';
import { ActionName } from '@/onebot/action/router';
import { z } from 'zod';

const SchemaData = z.object({
    cmd: z.string(),
    data: z.string(),
    rsp: z.boolean().default(true),
});

type Payload = z.infer<typeof SchemaData>;

export class SendPacket extends GetPacketStatusDepends<Payload, string | undefined> {
    override payloadSchema = SchemaData;
    override actionName = ActionName.SendPacket;
    async _handle(payload: Payload) {
        const data = await this.core.apis.PacketApi.pkt.operation.sendPacket({ cmd: payload.cmd, data: payload.data as PacketHexStr }, payload.rsp);
        return typeof data === 'object' ? data.toString('hex') : undefined;
    }
}
