import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { ChatType } from 'napcat-core';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  user_id: Type.String({ description: 'QQ号' }),
  event_type: Type.Number({ description: '事件类型' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '设置结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetInputStatus extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetInputStatus;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置输入状态';
  override actionTags = ['系统扩展'];
  override payloadExample = {
    user_id: '123456789',
    event_type: 1
  };
  override returnExample = null;

  async _handle (payload: PayloadType) {
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('uid is empty');
    const peer = {
      chatType: ChatType.KCHATTYPEC2C,
      peerUid: uid,
    };
    return await this.core.apis.MsgApi.sendShowInputStatusReq(peer, payload.event_type);
  }
}
