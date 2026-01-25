import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

const PayloadSchema = Type.Object({
  group_id: Type.String({ description: '群号' }),
  is_dismiss: Type.Optional(Type.Union([Type.Boolean(), Type.String()], { description: '是否解散' })),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Null({ description: '操作结果' });

type ReturnType = Static<typeof ReturnSchema>;

export default class SetGroupLeave extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetGroupLeave;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType): Promise<null> {
    await this.core.apis.GroupApi.quitGroup(payload.group_id.toString());
    return null;
  }
}
