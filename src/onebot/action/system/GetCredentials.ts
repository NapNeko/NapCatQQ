import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

interface Response {
    cookies: string,
    token: number
}

const SchemaData = {
    type: 'object',
    properties: {
        domain: { type: 'string' },
    },
    required: ['domain'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetCredentials extends BaseAction<Payload, Response> {
    actionName = ActionName.GetCredentials;
    payloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const cookiesObject = await this.core.apis.UserApi.getCookies(payload.domain);
        //把获取到的cookiesObject转换成 k=v; 格式字符串拼接在一起
        const cookies = Object.entries(cookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
        const bkn = cookiesObject?.skey ? this.core.apis.WebApi.getBknFromCookie(cookiesObject) : '';
        return { cookies: cookies, token: +bkn };
    }
}
