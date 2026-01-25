import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
import { ExtendsActionsExamples } from './examples';

const PayloadSchema = Type.Object({
  longNick: Type.String({ description: '签名内容' }),
});

type PayloadType = Static<typeof PayloadSchema>;

const ReturnSchema = Type.Any({ description: '设置结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class SetLongNick extends OneBotAction<PayloadType, ReturnType> {
  override actionName = ActionName.SetLongNick;
  override payloadSchema = PayloadSchema;
  override returnSchema = ReturnSchema;

  async _handle (payload: PayloadType) {
    return await this.core.apis.UserApi.setLongNick(payload.longNick);
  }
}
