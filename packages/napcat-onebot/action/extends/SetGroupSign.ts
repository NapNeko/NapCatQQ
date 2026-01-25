import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Void({ description: '打卡结果' });

type ReturnType = Static<typeof ReturnSchema>;

class SetGroupSignBase extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.PacketApi.pkt.operation.GroupSign(+payload.group_id);
  }
}

export class SetGroupSign extends SetGroupSignBase {
  override actionName = ActionName.SetGroupSign;
}

export class SendGroupSign extends SetGroupSignBase {
  override actionName = ActionName.SendGroupSign;
}
