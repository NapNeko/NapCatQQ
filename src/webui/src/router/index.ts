import { Router } from "express";
import { AuthHelper } from '../../src/helper/SignToken';
import { NextFunction, Request, Response } from 'express';
import { QQLoginRouter } from "./QQLogin";
import { AuthRouter } from "./auth";
const router = Router();
export async function AuthApi(req: Request, res: Response, next: NextFunction) {
    //判断当前url是否为/api/login 如果是跳过鉴权
    console.log(req.url);
    try {
        if (req.url == '/api/auth/login') {
            next();
            return;
        }
        if (req.headers?.authorization) {
            let token = req.headers?.authorization.split(' ')[1];
            let Credential = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
            let credentialJson = await AuthHelper.checkCredential(Credential);
            if (credentialJson) {
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
//router.use('/*', AuthApi);//鉴权
router.all("/test", (req, res) => {
    res.json({
        code: 0,
        msg: 'ok',
    });
});
router.use('/auth', AuthRouter);//挂载权限路由
router.use('/QQLogin',QQLoginRouter);
export { router as ALLRouter }