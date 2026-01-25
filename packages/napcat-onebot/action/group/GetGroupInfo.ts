import { OB11Construct } from '@/napcat-onebot/helper/data';
import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { OB11GroupSchema } from '../schemas';

import { GroupActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = OB11GroupSchema;

type ReturnType = Static<typeof ReturnSchema>;

class GetGroupInfo extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.GetGroupInfo;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '获取群信息';
  override actionDescription = '获取群聊的基本信息';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.GetGroupInfo.payload;

  async _handle (payload: PayloadType) {
    const group = (await this.core.apis.GroupApi.getGroups()).find(e => e.groupCode === payload.group_id.toString());
    if (!group) {
      const data = await this.core.apis.GroupApi.fetchGroupDetail(payload.group_id.toString());
      if (data.ownerUid && data.ownerUin === '0') {
        data.ownerUin = await this.core.apis.UserApi.getUinByUidV2(data.ownerUid);
      }
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
    return OB11Construct.group(group);
  }
}

export default GetGroupInfo;
