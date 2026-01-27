import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

import { ExtendsActionsExamples } from '../example/ExtendsActionsExamples';

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
  override actionSummary = '设置个性签名';
  override actionDescription = '修改当前登录帐号的个性签名';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.SetLongNick.payload;
  override returnExample = ExtendsActionsExamples.SetLongNick.response;

  async _handle (payload: PayloadType) {
    return await this.core.apis.UserApi.setLongNick(payload.longNick);
  }
}
