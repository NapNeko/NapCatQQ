import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from '../example/GroupActionsExamples';
import { assertGroupManagementResults } from './GroupOperationHelpers';

const MemberInvitePolicySchema = Type.Union([
  Type.Literal('disabled'),
  Type.Literal('require_approval'),
  Type.Literal('no_approval'),
  Type.Literal('no_approval_under_100'),
], {
  description: '成员邀请策略：禁止、需要管理员审核、无需审核、群成员少于100人时无需审核',
});

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  policy: MemberInvitePolicySchema,
});
type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });
type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupMemberInvitePolicy extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupMemberInvitePolicy;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置群成员邀请策略';
  override actionDescription = '设置是否允许群成员邀请好友进群，以及邀请是否需要管理员审核';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupMemberInvitePolicy.payload;
  override returnExample = GroupActionsExamples.SetGroupMemberInvitePolicy.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const results = await this.core.apis.GroupApi.setGroupMemberInvitePolicy(payload.group_id, payload.policy);
    assertGroupManagementResults('设置群成员邀请策略', results);
    return null;
  }
}
