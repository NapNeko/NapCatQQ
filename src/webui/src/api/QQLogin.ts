import { RequestHandler } from 'express';
import { WebUiDataRuntime } from '../helper/Data';
import { sleep } from '@/common/utils/helper';
const isEmpty = (data: any) => data === undefined || data === null || data === '';
export const QQGetQRcodeHandler: RequestHandler = async (req, res) => {
    if (await WebUiDataRuntime.getQQLoginStatus()) {
        res.send({
            code: -1,
            message: 'QQ Is Logined'
        });
        return;
    }
    const qrcodeUrl = await WebUiDataRuntime.getQQLoginQrcodeURL();
    if (isEmpty(qrcodeUrl)) {
        res.send({
            code: -1,
            message: 'QRCode Get Error'
        });
        return;
    }
    res.send({
        code: 0,
        message: 'success',
        data: {
            qrcode: qrcodeUrl
        }
    });
    return;
};
export const QQCheckLoginStatusHandler: RequestHandler = async (req, res) => {
    res.send({
        code: 0,
        message: 'success',
        data: {
            isLogin: await WebUiDataRuntime.getQQLoginStatus()
        }
    });
};
export const QQSetQuickLoginHandler: RequestHandler = async (req, res) => {
    const { uin } = req.body;
    const isLogin = await WebUiDataRuntime.getQQLoginStatus();
    if (isLogin) {
        res.send({
            code: -1,
            message: 'QQ Is Logined'
        });
        return;
    }
    if (isEmpty(uin)) {
        res.send({
            code: -1,
            message: 'uin is empty'
        });
        return;
    }
    const { result, message } = await WebUiDataRuntime.getQQQuickLogin(uin);
    if (!result) {
        res.send({
            code: -1,
            message: message
        });
        return;
    }
    //本来应该验证 但是http不宜这么搞 建议前端验证
    //isLogin = await WebUiDataRuntime.getQQLoginStatus();
    res.send({
        code: 0,
        message: 'success'
    });
};
export const QQGetQuickLoginListHandler: RequestHandler = async (req, res) => {
    const quickLoginList = await WebUiDataRuntime.getQQQuickLoginList();
    res.send({
        code: 0,
        data: quickLoginList
    });
};