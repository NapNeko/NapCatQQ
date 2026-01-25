import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Array(Type.Any(), { description: '禁言成员列表' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupShutList extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupShutList;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群禁言列表';
  override actionTags = ['群组接口'];
  override payloadExample = {
    group_id: '123456789'
  };
  override returnExample = [
    {
      user_id: 123456789,
      nickname: '禁言用户',
      shut_up_time: 1734567890
    }
  ];

  async _handle (payload: PayloadType) {
    return await this.core.apis.GroupApi.getGroupShutUpMemberList(payload.group_id.toString());
  }
}
