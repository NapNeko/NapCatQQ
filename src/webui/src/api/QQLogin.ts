import { RequestHandler } from 'express';

import { WebUiDataRuntime } from '@webapi/helper/Data';
import { isEmpty } from '@webapi/utils/check';
import { sendError, sendSuccess } from '@webapi/utils/response';

// 获取QQ登录二维码
export const QQGetQRcodeHandler: RequestHandler = async (req, res) => {
    // 判断是否已经登录
    if (await WebUiDataRuntime.getQQLoginStatus()) {
        // 已经登录
        return sendError(res, 'QQ Is Logined');
    }
    // 获取二维码
    const qrcodeUrl = await WebUiDataRuntime.getQQLoginQrcodeURL();
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
export const QQCheckLoginStatusHandler: RequestHandler = async (req, res) => {
    const data = {
        isLogin: await WebUiDataRuntime.getQQLoginStatus(),
        qrcodeurl: await WebUiDataRuntime.getQQLoginQrcodeURL(),
    };
    return sendSuccess(res, data);
};

// 快速登录
export const QQSetQuickLoginHandler: RequestHandler = async (req, res) => {
    // 获取QQ号
    const { uin } = req.body;
    // 判断是否已经登录
    const isLogin = await WebUiDataRuntime.getQQLoginStatus();
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
    //isLogin = await WebUiDataRuntime.getQQLoginStatus();
    return sendSuccess(res, null);
};

// 获取快速登录列表
export const QQGetQuickLoginListHandler: RequestHandler = async (_, res) => {
    const quickLoginList = await WebUiDataRuntime.getQQQuickLoginList();
    return sendSuccess(res, quickLoginList);
};
