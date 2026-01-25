import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  user_id: Type.String({ description: 'QQ号' }),
  special_title: Type.String({ default: '', description: '专属头衔' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Void({ description: '设置结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetSpecialTitle extends GetPacketStatusDepends<PayloadType, ReturnType> {
  override actionName = ActionName.SetSpecialTitle;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');
    await this.core.apis.PacketApi.pkt.operation.SetGroupSpecialTitle(+payload.group_id, uid, payload.special_title);
  }
}
