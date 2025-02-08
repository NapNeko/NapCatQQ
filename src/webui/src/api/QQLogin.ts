import { RequestHandler } from 'express';

import { WebUiDataRuntime } from '@webapi/helper/Data';
import { isEmpty } from '@webapi/utils/check';
import { sendError, sendSuccess } from '@webapi/utils/response';
import { WebUiConfig } from '@/webui';

// 获取QQ登录二维码
export const QQGetQRcodeHandler: RequestHandler = async (_, res) => {
    // 判断是否已经登录
    if (WebUiDataRuntime.getQQLoginStatus()) {
        // 已经登录
        return sendError(res, 'QQ Is Logined');
    }
    // 获取二维码
    const qrcodeUrl = WebUiDataRuntime.getQQLoginQrcodeURL();
    // 判断二维码是否为空
    if (isEmpty(qrcodeUrl)) {
        return sendError(res, 'QRCode Get Error');
    }
    // 返回二维码URL
    const data = {
        qrcode: qrcodeUrl,
    };
    return sendSuccess(res, data);
};

// 获取QQ登录状态
export const QQCheckLoginStatusHandler: RequestHandler = async (_, res) => {
    const data = {
        isLogin: WebUiDataRuntime.getQQLoginStatus(),
        qrcodeurl: WebUiDataRuntime.getQQLoginQrcodeURL(),
    };
    return sendSuccess(res, data);
};

// 快速登录
export const QQSetQuickLoginHandler: RequestHandler = async (req, res) => {
    // 获取QQ号
    const { uin } = req.body;
    // 判断是否已经登录
    const isLogin = WebUiDataRuntime.getQQLoginStatus();
    if (isLogin) {
        return sendError(res, 'QQ Is Logined');
    }
    // 判断QQ号是否为空
    if (isEmpty(uin)) {
        return sendError(res, 'uin is empty');
    }

    // 获取快速登录状态
    const { result, message } = await WebUiDataRuntime.requestQuickLogin(uin);
    if (!result) {
        return sendError(res, message);
    }
    //本来应该验证 但是http不宜这么搞 建议前端验证
    //isLogin = WebUiDataRuntime.getQQLoginStatus();
    return sendSuccess(res, null);
};

// 获取快速登录列表
export const QQGetQuickLoginListHandler: RequestHandler = async (_, res) => {
    const quickLoginList = WebUiDataRuntime.getQQQuickLoginList();
    return sendSuccess(res, quickLoginList);
};

// 获取快速登录列表（新）
export const QQGetLoginListNewHandler: RequestHandler = async (_, res) => {
    const newLoginList = WebUiDataRuntime.getQQNewLoginList();
    return sendSuccess(res, newLoginList);
};

// 获取登录的QQ的信息
export const getQQLoginInfoHandler: RequestHandler = async (_, res) => {
    const data = WebUiDataRuntime.getQQLoginInfo();
    return sendSuccess(res, data);
};

// 获取自动登录QQ账号
export const getAutoLoginAccountHandler: RequestHandler = async (_, res) => {
    const data = WebUiConfig.getAutoLoginAccount();
    return sendSuccess(res, data);
};

// 设置自动登录QQ账号
export const setAutoLoginAccountHandler: RequestHandler = async (req, res) => {
    const { uin } = req.body;
    await WebUiConfig.UpdateAutoLoginAccount(uin);
    return sendSuccess(res, null);
};
