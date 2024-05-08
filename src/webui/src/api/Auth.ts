import { RequestHandler } from "express";
import { AuthHelper } from "../helper/SignToken";
import { WebUiConfig } from "../helper/config";
import { DataRuntime } from "../helper/Data";
const isEmpty = (data: any) => data === undefined || data === null || data === '';
export const LoginHandler: RequestHandler = async (req, res) => {
    let WebUiConfigData = await WebUiConfig.GetWebUIConfig();
    const { token } = req.body;
    if (isEmpty(token)) {
        res.json({
            code: -1,
            message: 'token is empty'
        });
        return;
    } 
    if (!await DataRuntime.checkLoginRate(WebUiConfigData.loginRate)) {
        res.json({
            code: -1,
            message: 'login rate limit'
        });
        return;
    }
    //验证config.token是否等于token
    if (WebUiConfigData.token !== token) {
        res.json({
            code: -1,
            message: 'token is invalid'
        });
        return;
    }
    let signCredential = Buffer.from(JSON.stringify(await AuthHelper.signCredential(WebUiConfigData.token))).toString('base64');
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
export const checkHandler: RequestHandler = async (req, res) => {
    let WebUiConfigData = await WebUiConfig.GetWebUIConfig();
    const authorization = req.headers.authorization;
    try {
        let CredentialBase64:string = authorization?.split(' ')[1] as string;
        let Credential = JSON.parse(Buffer.from(CredentialBase64, 'base64').toString());
        await AuthHelper.validateCredentialWithinOneHour(WebUiConfigData.token,Credential)
        res.json({
            code: 0,
            message: 'success'
        });
    } catch (e) {
        res.json({
            code: -1,
            message: 'failed'
        });
    }

    return;
};
