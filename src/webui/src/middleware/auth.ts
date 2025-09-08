import { NextFunction, Request, Response } from 'express';

import { getInitialWebUiToken } from '@/webui';

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
        const hash = authorization[1];
        if(!hash) return sendError(res, 'Unauthorized');
        // 解析token
        let Credential: WebUiCredentialJson;
        try {
            Credential = JSON.parse(Buffer.from(hash, 'base64').toString('utf-8'));
        } catch (e) {
            return sendError(res, 'Unauthorized');
        }
        // 使用启动时缓存的token进行验证，而不是动态读取配置文件 因为有可能运行时手动修改了密码
        const initialToken = getInitialWebUiToken();
        if (!initialToken) {
            return sendError(res, 'Server token not initialized');
        }
        // 验证凭证在1小时内有效
        const credentialJson = AuthHelper.validateCredentialWithinOneHour(initialToken, Credential);
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
