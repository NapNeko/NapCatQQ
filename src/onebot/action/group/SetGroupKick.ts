import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const SchemaData = Type.Object({
  group_id: Type.Union([Type.Number(), Type.String()]),
  user_id: Type.Union([Type.Number(), Type.String()]),
  reject_add_request: Type.Optional(Type.Union([Type.Boolean(), Type.String()])),
});

type Payload = Static<typeof SchemaData>;

export default class SetGroupKick extends OneBotAction<Payload, null> {
  override actionName = ActionName.SetGroupKick;
  override payloadSchema = SchemaData;

  async _handle (payload: Payload): Promise<null> {
    if (payload.user_id === 'all') {
      throw new Error('无法踢出全体成员，user_id 不能为 "all"');
    }

    const rejectReq = payload.reject_add_request?.toString() === 'true';
    const uid = await this.core.apis.UserApi.getUidByUinV2(payload.user_id.toString());
    if (!uid) throw new Error('get Uid Error');
    await this.core.apis.GroupApi.kickMember(payload.group_id.toString(), [uid], rejectReq);
    return null;
  }
}
