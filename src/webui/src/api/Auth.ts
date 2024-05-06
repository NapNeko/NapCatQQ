import { RequestHandler } from "express";
import { AuthHelper } from "../helper/SignToken";
import { WebUIConfig } from "../helper/config";
import { DataRuntime } from "../helper/Data";
const isEmpty = (data: any) => data === undefined || data === null || data === '';
export const LoginHandler: RequestHandler = async (req, res) => {
    const { token } = req.body;
    if (isEmpty(token)) {
        res.json({
            code: 0,
            message: 'token is empty'
        });
        return;
    }
    let config = await WebUIConfig();
    if (!DataRuntime.checkLoginRate(config.loginRate)) {
        res.json({
            code: 0,
            message: 'login rate limit'
        });
        return;
    }
    let signCredential = Buffer.from(JSON.stringify(AuthHelper.signCredential(config.token))).toString('base64');
    res.json({
        code: 0,
        message: 'success',
        data: {
            "Credential": signCredential
        }
    });
    return;
};
export const LogoutHandler: RequestHandler = (req, res) => {
    // 这玩意无状态销毁个灯 得想想办法
    res.json({
        code: 0,
        message: 'success'
    });
    return;
};
