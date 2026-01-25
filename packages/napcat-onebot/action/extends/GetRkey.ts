import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Type, Static } from '@sinclair/typebox';

const ReturnSchema = Type.Array(Type.Any(), { description: 'Rkey列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetRkey extends GetPacketStatusDepends<void, ReturnType> {
  override actionName = ActionName.GetRkey;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;

  async _handle () {
    return await this.core.apis.PacketApi.pkt.operation.FetchRkey();
  }
}
