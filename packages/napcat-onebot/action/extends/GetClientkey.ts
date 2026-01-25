import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { Type, Static } from '@sinclair/typebox';

const ReturnSchema = Type.Object({
  clientkey: Type.Optional(Type.String({ description: '客户端Key' })),
}, { description: '获取ClientKey结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetClientkey extends OneBotAction<void, ReturnType> {
  override actionName = ActionName.GetClientkey;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;

  async _handle () {
    return { clientkey: (await this.core.apis.UserApi.forceFetchClientKey()).clientKey };
  }
}
