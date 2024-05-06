import { RequestHandler } from "express";
import { DataRuntime } from "../helper/Data";

export const QQGetQRcodeHandler: RequestHandler = async (req, res) => {
    if (await DataRuntime.getQQLoginStatus()) {
        res.send({
            code: -1,
            message: 'QQ Is Logined'
        });
    }
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