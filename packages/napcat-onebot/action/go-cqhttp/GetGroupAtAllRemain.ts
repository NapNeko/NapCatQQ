import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Object({
  can_at_all: Type.Boolean({ description: '是否可以艾特全体' }),
  remain_at_all_count_for_group: Type.Number({ description: '群艾特全体剩余次数' }),
  remain_at_all_count_for_uin: Type.Number({ description: '个人艾特全体剩余次数' }),
}, { description: '群艾特全体剩余次数' });

type ReturnType = Static<typeof ReturnSchema>;

export class GoCQHTTPGetGroupAtAllRemain extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GoCQHTTP_GetGroupAtAllRemain;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionDescription = '获取群艾特全体剩余次数';
  override actionTags = ['群组接口'];

  async _handle (payload: PayloadType) {
    const ret = await this.core.apis.GroupApi.getGroupRemainAtTimes(payload.group_id.toString());
    const data = {
      can_at_all: ret.atInfo.canAtAll,
      remain_at_all_count_for_group: ret.atInfo.RemainAtAllCountForGroup,
      remain_at_all_count_for_uin: ret.atInfo.RemainAtAllCountForUin,
    };
    return data;
  }
}
