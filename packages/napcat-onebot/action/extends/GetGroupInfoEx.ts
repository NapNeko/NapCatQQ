import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';
const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '群扩展信息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupInfoEx extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupInfoEx;
  override actionSummary = '获取群详细信息 (扩展)';
  override actionTags = ['群组扩展'];
  override payloadExample = {
    group_id: 123456
  };
  override returnExample = {
    group_id: 123456,
    group_name: '测试群',
    member_count: 100
  };
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return (await this.core.apis.GroupApi.getGroupExtFE0Info([payload.group_id.toString()])).result.groupExtInfos.get(payload.group_id.toString());
  }
}
