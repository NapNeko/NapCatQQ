import { RequestHandler } from 'express';

import { WebUiConfig, getInitialWebUiToken, setInitialWebUiToken } from '@/webui';

import { AuthHelper } from '@webapi/helper/SignToken';
import { WebUiDataRuntime } from '@webapi/helper/Data';
import { sendSuccess, sendError } from '@webapi/utils/response';
import { isEmpty } from '@webapi/utils/check';

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
    // 使用启动时缓存的token进行验证，而不是动态读取配置文件
    const initialToken = getInitialWebUiToken();
    if (!initialToken) {
        return sendError(res, 'Server token not initialized');
    }
    //验证初始token hash是否等于提交的token hash
    if (!AuthHelper.comparePasswordHash(initialToken, hash)) {
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

        // 使用启动时缓存的token进行验证
        const initialToken = getInitialWebUiToken();
        if (!initialToken) {
            return sendError(res, 'Server token not initialized');
        }
        // 验证凭证是否在一小时内有效
        const valid = AuthHelper.validateCredentialWithinOneHour(initialToken, Credential);
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

    if (isEmpty(newToken)) {
        return sendError(res, 'newToken is empty');
    }

    // 强制要求旧密码
    if (isEmpty(oldToken)) {
        return sendError(res, 'oldToken is required');
    }

    // 检查新旧密码是否相同
    if (oldToken === newToken) {
        return sendError(res, '新密码不能与旧密码相同');
    }

    // 检查新密码强度
    if (newToken.length < 6) {
        return sendError(res, '新密码至少需要6个字符');
    }
    
    // 检查是否包含字母
    if (!/[a-zA-Z]/.test(newToken)) {
        return sendError(res, '新密码必须包含字母');
    }
    
    // 检查是否包含数字
    if (!/[0-9]/.test(newToken)) {
        return sendError(res, '新密码必须包含数字');
    }

    try {
        // 注销当前的Token
        if (authorization) {
            const CredentialBase64: string = authorization.split(' ')[1] as string;
            const Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());
            AuthHelper.revokeCredential(Credential);
        }

        // 使用启动时缓存的token进行验证
        const initialToken = getInitialWebUiToken();
        if (!initialToken) {
            return sendError(res, 'Server token not initialized');
        }
        if (initialToken !== oldToken) {
            return sendError(res, '旧 token 不匹配');
        }
        // 直接更新配置文件中的token，不需要通过WebUiConfig.UpdateToken方法
        await WebUiConfig.UpdateWebUIConfig({ token: newToken });
        // 更新内存中的缓存token，使新密码立即生效
        setInitialWebUiToken(newToken);
        
        return sendSuccess(res, 'Token updated successfully');
    } catch (e: any) {
        return sendError(res, `Failed to update token: ${e.message}`);
    }
};
