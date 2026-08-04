import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from '../example/GroupActionsExamples';
import { assertGroupManagementResults } from './GroupOperationHelpers';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  visible: Type.Boolean({ description: '新成员默认可见最近聊天记录' }),
});
type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });
type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupNewMemberHistoryVisibility extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupNewMemberHistoryVisibility;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '设置新成员历史消息可见性';
  override actionDescription = '设置新入群成员默认是否可以查看最近聊天记录';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.SetGroupNewMemberHistoryVisibility.payload;
  override returnExample = GroupActionsExamples.SetGroupNewMemberHistoryVisibility.response;

  async _handle (payload: PayloadType): Promise<ReturnType> {
    const results = await this.core.apis.GroupApi.setGroupNewMemberHistoryVisibility(
      payload.group_id,
      payload.visible
    );
    assertGroupManagementResults('设置新成员历史消息可见性', results);
    return null;
  }
}
