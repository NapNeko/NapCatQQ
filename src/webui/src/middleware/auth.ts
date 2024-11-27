import { NextFunction, Request, Response } from 'express';

import { WebUiConfig } from '@/webui';

import { AuthHelper } from '@webapi/helper/SignToken';
import { sendError } from '@webapi/utils/response';

// 鉴权中间件
export async function auth(req: Request, res: Response, next: NextFunction) {
    // 判断当前url是否为/login 如果是跳过鉴权
    if (req.url == '/auth/login') {
        return next();
    }

    // 判断是否有Authorization头
    if (req.headers?.authorization) {
        // 切割参数以获取token
        const authorization = req.headers.authorization.split(' ');
        // 当Bearer后面没有参数时
        if (authorization.length < 2) {
            return sendError(res, 'Unauthorized');
        }
        // 获取token
        const token = authorization[1];
        // 解析token
        let Credential: WebUiCredentialJson;
        try {
            Credential = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        } catch (e) {
            return sendError(res, 'Unauthorized');
        }
        // 获取配置
        const config = await WebUiConfig.GetWebUIConfig();
        // 验证凭证在1小时内有效且token与原始token相同
        const credentialJson = await AuthHelper.validateCredentialWithinOneHour(config.token, Credential);
        if (credentialJson) {
            // 通过验证
            return next();
        }
        // 验证失败
        return sendError(res, 'Unauthorized');
    }

    // 没有Authorization头
    return sendError(res, 'Unauthorized');
}
