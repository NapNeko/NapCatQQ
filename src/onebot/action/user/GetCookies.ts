import { OneBotAction } from '@/onebot/action/OneBotAction';
import { ActionName } from '@/onebot/action/router';
import { Static, Type } from '@sinclair/typebox';
interface Response {
    cookies: string,
    bkn: string
}

const SchemaData = Type.Object({
    domain: Type.String()
});

type Payload = Static<typeof SchemaData>;

export class GetCookies extends OneBotAction<Payload, Response> {
    override actionName = ActionName.GetCookies;
    override payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const cookiesObject = await this.core.apis.UserApi.getCookies(payload.domain);
        //把获取到的cookiesObject转换成 k=v; 格式字符串拼接在一起
        const cookies = Object.entries(cookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
        const bkn = cookiesObject?.['skey'] ? this.core.apis.WebApi.getBknFromCookie(cookiesObject) : '';
        return { cookies, bkn };
    }
}
