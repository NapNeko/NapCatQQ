import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';

export class GetRkey extends GetPacketStatusDepends<void, Array<unknown>> {
  override actionName = ActionName.GetRkey;

  async _handle () {
    return await this.core.apis.PacketApi.pkt.operation.FetchRkey();
  }
}
