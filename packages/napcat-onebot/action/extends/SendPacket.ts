import { PacketBuf } from 'napcat-core/packet/transformer/base';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  cmd: Type.String({ description: '命令字' }),
  data: Type.String({ description: '十六进制数据' }),
  rsp: Type.Union([Type.String(), Type.Boolean()], { default: true, description: '是否等待响应' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Union([Type.String({ description: '响应十六进制数据' }), Type.Undefined()], { description: '发包结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SendPacket extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionName = ActionName.SendPacket;
  async _handle (payload: PayloadType) {
    const rsp = typeof payload.rsp === 'boolean' ? payload.rsp : payload.rsp === 'true';
    const packetData = Buffer.from(payload.data, 'hex') as unknown as PacketBuf;
    const data = await this.core.apis.PacketApi.pkt.operation.sendPacket({ cmd: payload.cmd, data: packetData }, rsp);
    return typeof data === 'object' ? data.toString('hex') : undefined;
  }
}
