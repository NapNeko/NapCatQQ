import { RequestHandler } from "express";
import { DataRuntime } from "../helper/Data";
const isEmpty = (data: any) => data === undefined || data === null || data === '';
export const QQGetQRcodeHandler: RequestHandler = async (req, res) => {
    if (await DataRuntime.getQQLoginStatus()) {
        res.send({
            code: -1,
            message: 'QQ Is Logined'
        });
        return;
    }
    let qrcodeUrl = await DataRuntime.getQQLoginQrcodeURL();
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
export const QQCheckLoginStatusHandler: RequestHandler = (req, res) => {
    res.send({
        code: 0,
        message: 'success',
        data: {
            isLogin: DataRuntime.getQQLoginStatus()
        }
    });
};
export const QQQuickLoginHandler: RequestHandler = async (req, res) => {
    // 未完成
    const { token } = req.body;
    if (token) {
        const isLogin = await DataRuntime.getQQLoginStatus();
    }
    // 未实现
    res.send({
        code: 0,
        message: 'success'
    });
}