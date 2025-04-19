import { RequestHandler } from 'express';

import { WebUiConfig } from '@/webui';

import { AuthHelper } from '@webapi/helper/SignToken';
import { WebUiDataRuntime } from '@webapi/helper/Data';
import { sendSuccess, sendError } from '@webapi/utils/response';
import { isEmpty } from '@webapi/utils/check';

// 检查是否使用默认Token
export const CheckDefaultTokenHandler: RequestHandler = async (_, res) => {
    const webuiToken = await WebUiConfig.GetWebUIConfig();
    if (webuiToken.token === 'napcat') {
        return sendSuccess(res, true);
    }
    return sendSuccess(res, false);
};

// 登录
export const LoginHandler: RequestHandler = async (req, res) => {
    // 获取WebUI配置
    const WebUiConfigData = await WebUiConfig.GetWebUIConfig();
    // 获取请求体中的hash
    const { hash } = req.body;
    // 获取客户端IP
    const clientIP = req.ip || req.socket.remoteAddress || '';

    // 如果token为空，返回错误信息
    if (isEmpty(hash)) {
        return sendError(res, 'token is empty');
    }
    // 检查登录频率
    if (!WebUiDataRuntime.checkLoginRate(clientIP, WebUiConfigData.loginRate)) {
        return sendError(res, 'login rate limit');
    }
    //验证config.token hash是否等于token hash
    if (!AuthHelper.comparePasswordHash(WebUiConfigData.token, hash)) {
        return sendError(res, 'token is invalid');
    }

    // 签发凭证
    const signCredential = Buffer.from(JSON.stringify(AuthHelper.signCredential(hash))).toString(
        'base64'
    );
    // 返回成功信息
    return sendSuccess(res, {
        Credential: signCredential,
    });
};

// 退出登录
export const LogoutHandler: RequestHandler = async (req, res) => {
    const authorization = req.headers.authorization;
    try {
        const CredentialBase64: string = authorization?.split(' ')[1] as string;
        const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());
        AuthHelper.revokeCredential(Credential);
        return sendSuccess(res, 'Logged out successfully');
    } catch (e) {
        return sendError(res, 'Logout failed');
    }
};

// 检查登录状态
export const checkHandler: RequestHandler = async (req, res) => {
    // 获取WebUI配置
    const WebUiConfigData = await WebUiConfig.GetWebUIConfig();
    // 获取请求头中的Authorization
    const authorization = req.headers.authorization;
    // 检查凭证
    try {
        // 从Authorization中获取凭证
        const CredentialBase64: string = authorization?.split(' ')[1] as string;
        // 解析凭证
        const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());

        // 检查凭证是否已被注销
        if (AuthHelper.isCredentialRevoked(Credential)) {
            return sendError(res, 'Token has been revoked');
        }

        // 验证凭证是否在一小时内有效
        const valid = AuthHelper.validateCredentialWithinOneHour(WebUiConfigData.token, Credential);
        // 返回成功信息
        if (valid) return sendSuccess(res, null);
        // 返回错误信息
        return sendError(res, 'Authorization Failed');
    } catch (e) {
        // 返回错误信息
        return sendError(res, 'Authorization Failed');
    }
};

// 修改密码（token）
export const UpdateTokenHandler: RequestHandler = async (req, res) => {
    const { oldToken, newToken } = req.body;
    const authorization = req.headers.authorization;

    if (isEmpty(oldToken) || isEmpty(newToken)) {
        return sendError(res, 'oldToken or newToken is empty');
    }

    try {
        // 注销当前的Token
        if (authorization) {
            const CredentialBase64: string = authorization.split(' ')[1] as string;
            const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());
            AuthHelper.revokeCredential(Credential);
        }

        await WebUiConfig.UpdateToken(oldToken, newToken);
        return sendSuccess(res, 'Token updated successfully');
    } catch (e: any) {
        return sendError(res, `Failed to update token: ${e.message}`);
    }
};
