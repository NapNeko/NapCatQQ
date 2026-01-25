import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  group_id: Type.Number({ description: '群号' }),
  group_name: Type.String({ description: '群名称' }),
  member_count: Type.Number({ description: '成员数量' }),
  max_member_count: Type.Number({ description: '最大成员数量' }),
  group_all_shut: Type.Number({ description: '全员禁言状态' }),
  group_remark: Type.String({ description: '群备注' }),
}, { description: '群详细信息' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetGroupDetailInfo extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupDetailInfo;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群详细信息';
  override actionDescription = '获取群聊的详细信息，包括成员数、最大成员数等';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.GetGroupDetailInfo.payload;
  override returnExample = GroupActionsExamples.GetGroupDetailInfo.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const data = await this.core.apis.GroupApi.fetchGroupDetail(payload.group_id.toString());
    return {
      ...data,
      group_all_shut: data.shutUpAllTimestamp > 0 ? -1 : 0,
      group_remark: '',
      group_id: +payload.group_id,
      group_name: data.groupName,
      member_count: data.memberNum,
      max_member_count: data.maxMemberNum,
    };
  }
}
