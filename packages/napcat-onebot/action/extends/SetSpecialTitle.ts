import { ActionName } from '@/napcat-onebot/action/router';
import { GetPacketStatusDepends } from '@/napcat-onebot/action/packet/GetPacketStatus';
import { Static, Type } from '@sinclair/typebox';

import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';

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
  override actionSummary = '设置专属头衔';
  override actionDescription = '设置群聊中指定成员的专属头衔';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.SetSpecialTitle.payload;
  override returnExample = ExtendsActionsExamples.SetSpecialTitle.response;

  async _handle (payload: PayloadType) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('User not found');
    await this.core.apis.PacketApi.pkt.operation.SetGroupSpecialTitle(+payload.group_id, uid, payload.special_title);
  }
}
