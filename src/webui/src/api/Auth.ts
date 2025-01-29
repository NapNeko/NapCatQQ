import { RequestHandler } from 'express';

import { WebUiConfig } from '@/webui';

import { AuthHelper } from '@webapi/helper/SignToken';
import { WebUiDataRuntime } from '@webapi/helper/Data';
import { sendSuccess, sendError } from '@webapi/utils/response';
import { isEmpty } from '@webapi/utils/check';

// 登录
export const LoginHandler: RequestHandler = async (req, res) => {
    // 获取WebUI配置
    const WebUiConfigData = await WebUiConfig.GetWebUIConfig();
    // 获取请求体中的token
    const { token } = req.body;
    // 如果token为空，返回错误信息
    if (isEmpty(token)) {
        return sendError(res, 'token is empty');
    }
    // 检查登录频率
    if (!WebUiDataRuntime.checkLoginRate(WebUiConfigData.loginRate)) {
        return sendError(res, 'login rate limit');
    }
    //验证config.token是否等于token
    if (WebUiConfigData.token !== token) {
        return sendError(res, 'token is invalid');
    }
    // 签发凭证
    const signCredential = Buffer.from(JSON.stringify(await AuthHelper.signCredential(WebUiConfigData.token))).toString(
        'base64'
    );
    // 返回成功信息
    return sendSuccess(res, {
        Credential: signCredential,
    });
};

// 退出登录
export const LogoutHandler: RequestHandler = (_, res) => {
    // TODO: 这玩意无状态销毁个灯 得想想办法
    return sendSuccess(res, null);
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
        // 验证凭证是否在一小时内有效
        await AuthHelper.validateCredentialWithinOneHour(WebUiConfigData.token, Credential);
        // 返回成功信息
        return sendSuccess(res, null);
    } catch (e) {
        // 返回错误信息
        return sendError(res, 'Authorization Faild');
    }
};

// 修改密码（token）
export const UpdateTokenHandler: RequestHandler = async (req, res) => {
    const { oldToken, newToken } = req.body;

    if (isEmpty(oldToken) || isEmpty(newToken)) {
        return sendError(res, 'oldToken or newToken is empty');
    }

    try {
        await WebUiConfig.UpdateToken(oldToken, newToken);
        return sendSuccess(res, 'Token updated successfully');
    } catch (e: any) {
        return sendError(res, `Failed to update token: ${e.message}`);
    }
};
