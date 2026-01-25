import { OneBotAction } from '@/napcat-onebot/action/OneBotAction';
import { ActionName } from '@/napcat-onebot/action/router';
import { Static, Type } from '@sinclair/typebox';

export const GetCookiesPayloadSchema = Type.Object({
  domain: Type.String({ description: '需要获取 cookies 的域名' }),
});

export type GetCookiesPayload = Static<typeof GetCookiesPayloadSchema>;

export const GetCookiesReturnSchema = Type.Object({
  cookies: Type.String({ description: 'Cookies' }),
  bkn: Type.String({ description: 'CSRF Token' }),
});

export type GetCookiesResponse = Static<typeof GetCookiesReturnSchema>;

export class GetCookies extends OneBotAction<GetCookiesPayload, GetCookiesResponse> {
  override actionName = ActionName.GetCookies;
  override payloadSchema = GetCookiesPayloadSchema;
  override returnSchema = GetCookiesReturnSchema;

  async _handle (payload: GetCookiesPayload) {
    const cookiesObject = await this.core.apis.UserApi.getCookies(payload.domain);
    // 把获取到的cookiesObject转换成 k=v; 格式字符串拼接在一起
    const cookies = Object.entries(cookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
    const bkn = cookiesObject?.['skey'] ? this.core.apis.WebApi.getBknFromCookie(cookiesObject) : '';
    return { cookies, bkn };
  }
}
