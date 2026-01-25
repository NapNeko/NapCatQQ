import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Type, Static } from '@sinclair/typebox';

export const GetCSRFReturnSchema = Type.Object({
  token: Type.Number({ description: 'CSRF Token' }),
});

export type GetCSRFReturnType = Static<typeof GetCSRFReturnSchema>;

export class GetCSRF extends OneBotAction<void, GetCSRFReturnType> {
  override actionName = ActionName.GetCSRF;
  override payloadSchema = Type.Object({});
  override returnSchema = GetCSRFReturnSchema;
  override actionSummary = '获取 CSRF Token';
  override actionDescription = '获取 CSRF Token';
  override actionTags = ['系统接口'];
  override payloadExample = {};
  override returnExample = {
    token: 123456789
  };

  async _handle () {
    const sKey = await this.core.apis.UserApi.getSKey();
    if (!sKey) {
      throw new Error('SKey is undefined');
    }
    return {
      token: +this.core.apis.WebApi.getBknFromSKey(sKey),
    };
  }
}
