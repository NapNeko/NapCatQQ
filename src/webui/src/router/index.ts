import { Router } from "express";
import { AuthHelper } from '../../src/helper/SignToken';
import { NextFunction, Request, Response } from 'express';
import { QQLoginRouter } from "./QQLogin";
import { AuthRouter } from "./auth";
import { OB11ConfigRouter } from "./OB11Config";
import { WebUiConfig } from "../helper/config";
const router = Router();
export async function AuthApi(req: Request, res: Response, next: NextFunction) {
    //判断当前url是否为/login 如果是跳过鉴权
    try {
        if (req.url == '/auth/login') {
            next();
            return;
        }
        if (req.headers?.authorization) {
            let token = req.headers?.authorization.split(' ')[1];
            let Credential = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
            let config = await WebUiConfig.GetWebUIConfig();
            let credentialJson = await AuthHelper.validateCredentialWithinOneHour(config.token, Credential);
            if (credentialJson) {
                //通过验证
                next();
            }
            res.json({
                code: -1,
                msg: 'Unauthorized',
            });
            return;
        }
    } catch (e: any) {
        res.json({
            code: -1,
            msg: 'Server Error',
        });
        return;
    }
    res.json({
        code: -1,
        msg: 'Server Error',
    });
    return;
}
router.use(AuthApi);
router.all("/test", (req, res) => {
    res.json({
        code: 0,
        msg: 'ok',
    });
});
router.use('/auth', AuthRouter);
router.use('/QQLogin', QQLoginRouter);
router.use('/OB11Config', OB11ConfigRouter);
export { router as ALLRouter }