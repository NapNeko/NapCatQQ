import { ActionName } from '@/napcat-onebot/action/router';
import { OneBotAction } from '../OneBotAction';
import { Type, Static } from '@sinclair/typebox';

import { ExtendsActionsExamples } from './examples';

const ReturnSchema = Type.Object({
  clientkey: Type.Optional(Type.String({ description: '客户端Key' })),
}, { description: '获取ClientKey结果' });

type ReturnType = Static<typeof ReturnSchema>;

export class GetClientkey extends OneBotAction<void, ReturnType> {
  override actionName = ActionName.GetClientkey;
  override payloadSchema = Type.Void();
  override returnSchema = ReturnSchema;
  override actionSummary = '获取ClientKey';
  override actionDescription = '获取当前登录帐号的ClientKey';
  override actionTags = ['扩展接口'];
  override payloadExample = ExtendsActionsExamples.GetClientkey.payload;
  override returnExample = ExtendsActionsExamples.GetClientkey.response;

  async _handle () {
    return { clientkey: (await this.core.apis.UserApi.forceFetchClientKey()).clientKey };
  }
}
