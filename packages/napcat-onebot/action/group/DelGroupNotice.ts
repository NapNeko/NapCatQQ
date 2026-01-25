import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ActionExamples } from '../examples';

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
  override actionDescription = '删除群公告';
  override actionTags = ['群组接口'];
  override payloadExample = ActionExamples.DelGroupNotice.payload;

  async _handle (payload: PayloadType) {
    const group = payload.group_id.toString();
    const noticeId = payload.notice_id;
    return await this.core.apis.GroupApi.deleteGroupBulletin(group, noticeId);
  }
}
