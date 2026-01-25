import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  user_id: Type.String({ description: 'QQ号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  status: Type.Number({ description: '在线状态' }),
  ext_status: Type.Number({ description: '扩展状态' }),
}, { description: '用户状态' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetUserStatus extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.GetUserStatus;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const res = await this.core.apis.PacketApi.pkt.operation.GetStrangerStatus(+payload.user_id);
    if (!res) {
      throw new Error('无法获取用户状态');
    }
    return res;
  }
}
