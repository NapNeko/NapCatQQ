import { Static, Type } from '@sinclair/typebox';
import { SatoriAction } from '../SatoriAction';
import { SatoriActionName } from '../router';
import { GroupNotifyMsgType, NTGroupRequestOperateTypes } from 'napcat-core';

const SchemaData = Type.Object({
  message_id: Type.String(), // 邀请请求的 seq
  approve: Type.Boolean(),
  comment: Type.Optional(Type.String()),
});

type Payload = Static<typeof SchemaData>;

export class GuildApproveAction extends SatoriAction<Payload, void> {
  actionName = SatoriActionName.GuildApprove;
  override payloadSchema = SchemaData;

  protected async _handle (payload: Payload): Promise<void> {
    const { message_id, approve, comment } = payload;

    // message_id 是邀请请求的 seq
    const notifies = await this.core.apis.GroupApi.getSingleScreenNotifies(true, 100);
    const notify = notifies.find(
      (e) =>
        e.seq == message_id && // 使用 loose equality 以防类型不匹配
        (e.type === GroupNotifyMsgType.INVITED_BY_MEMBER || e.type === GroupNotifyMsgType.REQUEST_JOIN_NEED_ADMINI_STRATOR_PASS)
    );

    if (!notify) {
      throw new Error(`未找到加群邀请: ${message_id}`);
    }

    const operateType = approve
      ? NTGroupRequestOperateTypes.KAGREE
      : NTGroupRequestOperateTypes.KREFUSE;

    await this.core.apis.GroupApi.handleGroupRequest(false, notify, operateType, comment);
  }
}
