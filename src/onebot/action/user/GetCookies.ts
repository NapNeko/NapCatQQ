import BaseAction from '../BaseAction';
import { ActionName } from '../types';
import { FromSchema, JSONSchema } from 'json-schema-to-ts';

interface Response {
    cookies: string,
    bkn: string
}

const SchemaData = {
    type: 'object',
    properties: {
        domain: { type: 'string' },
    },
    required: ['domain'],
} as const satisfies JSONSchema;

type Payload = FromSchema<typeof SchemaData>;

export class GetCookies extends BaseAction<Payload, Response> {
    actionName = ActionName.GetCookies;
    PayloadSchema = SchemaData;

    async _handle(payload: Payload) {
        const NTQQUserApi = this.CoreContext.apis.UserApi;
        const NTQQWebApi = this.CoreContext.apis.WebApi;
        // if (!payload.domain) {
        //   throw new Error('缺少参数 domain');
        // }
        // if (payload.domain.endsWith('qzone.qq.com')) {
        //   // 兼容整个 *.qzone.qq.com
        //   const data = (await NTQQUserApi.getQzoneCookies());
        //   const Bkn = WebApi.genBkn(data.p_skey);
        //   const CookieValue = 'p_skey=' + data.p_skey + '; skey=' + data.skey + '; p_uin=o' + selfInfo.uin + '; uin=o' + selfInfo.uin;
        //   return { cookies: CookieValue };
        // }
        // // 取Skey
        // // 先NodeIKernelTicketService.forceFetchClientKey('')
        // // 返回值
        // // {
        // //     result: 0,
        // //     errMsg: '',
        // //     url: '',
        // //     keyIndex: '19',
        // //     clientKey: 'clientKey',
        // //     expireTime: '7200'
        // //   }
        // // request https://ssl.ptlogin2.qq.com/jump?ptlang=1033&clientuin=1627126029&clientkey=key
        // // &u1=https%3A%2F%2Fh5.qzone.qq.com%2Fqqnt%2Fqzoneinpcqq%2Ffriend%3Frefresh%3D0%26clientuin%3D0%26darkMode%3D0&keyindex=keyIndex
        // const _PSkey = (await NTQQUserApi.getPSkey([payload.domain]))[payload.domain];
        // // 取Pskey 
        // // NodeIKernelTipOffService.getPskey([ 'qun.qq.com' ], true )
        // // {
        // //     domainPskeyMap: 0,
        // //     errMsg: 'success',
        // //     domainPskeyMap: Map(1) {
        // //       'qun.qq.com' => 'pskey'
        // //     }
        // //   }
        // if (!_PSkey || !_Skey) {
        //   throw new Error('获取Cookies失败');
        // }
        // const cookies = `p_skey=${_PSkey}; skey=${_Skey}; p_uin=o${selfInfo.uin}; uin=o${selfInfo.uin}`;
        // return {
        //   cookies
        // };
        const cookiesObject = await NTQQUserApi.getCookies(payload.domain);
        //把获取到的cookiesObject转换成 k=v; 格式字符串拼接在一起
        const cookies = Object.entries(cookiesObject).map(([key, value]) => `${key}=${value}`).join('; ');
        const bkn = cookiesObject?.skey ? NTQQWebApi.getBknFromCookie(cookiesObject) : '';
        return { cookies, bkn };
    }
}
