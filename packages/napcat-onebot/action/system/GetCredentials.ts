import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetCredentialsPayloadSchema = Type.Object({
  domain: Type.String({ description: '需要获取 cookies 的域名' }),
});

export type GetCredentialsPayload = Static<typeof GetCredentialsPayloadSchema>;

export const GetCredentialsReturnSchema = Type.Object({
  cookies: Type.String({ description: 'Cookies' }),
  token: Type.Number({ description: 'CSRF Token' }),
});

export type GetCredentialsResponse = Static<typeof GetCredentialsReturnSchema>;

export class GetCredentials extends OneBotAction<GetCredentialsPayload, GetCredentialsResponse> {
  override actionName = ActionName.GetCredentials;
  override payloadSchema = GetCredentialsPayloadSchema;
  override returnSchema = GetCredentialsReturnSchema;

  async _handle (payload: GetCredentialsPayload) {
    const cookiesObject = await this.core.apis.UserApi.getCookies(payload.domain);
    // 把获取到的cookiesObject转换成 k=v; 格式字符串拼接在一起
    const cookies = Object.entries(cookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const bkn = cookiesObject?.['skey'] ? this.core.apis.WebApi.getBknFromCookie(cookiesObject) : '';
    return { cookies, token: +bkn };
  }
}
