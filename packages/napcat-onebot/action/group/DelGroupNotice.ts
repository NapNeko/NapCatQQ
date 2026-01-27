import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { GroupActionsExamples } from '../example/GroupActionsExamples';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  notice_id: Type.String({ description: '公告ID' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class DelGroupNotice extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.DelGroupNotice;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;
  override actionSummary = '删除群公告';
  override actionDescription = '删除群聊中的公告';
  override actionTags = ['群组接口'];
  override payloadExample = GroupActionsExamples.DelGroupNotice.payload;
  override returnExample = GroupActionsExamples.DelGroupNotice.response;

  async _handle (payload: PayloadType) {
    const group = payload.group_id.toString();
    const noticeId = payload.notice_id;
    return await this.core.apis.GroupApi.deleteGroupBulletin(group, noticeId);
  }
}
