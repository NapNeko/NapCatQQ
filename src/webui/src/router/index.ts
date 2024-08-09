import { Router } from 'express';
import { AuthHelper } from '../../src/helper/SignToken';
import { NextFunction, Request, Response } from 'express';
import { QQLoginRouter } from './QQLogin';
import { AuthRouter } from './auth';
import { OB11ConfigRouter } from './OB11Config';
import { WebUiConfig } from '../helper/config';
const router = Router();
export async function AuthApi(req: Request, res: Response, next: NextFunction) {
    //判断当前url是否为/login 如果是跳过鉴权
    if (req.url == '/auth/login') {
        next();
        return;
    }
    if (req.headers?.authorization) {
        const authorization = req.headers.authorization.split(' ');
        if (authorization.length < 2) {
            res.json({
                code: -1,
                msg: 'Unauthorized',
            });
            return;
        }
        const token = authorization[1];
        let Credential: any;
        try {
            Credential = JSON.parse(Buffer.from(token, 'base64').toString('utf-8'));
        } catch (e) {
            res.json({
                code: -1,
                msg: 'Unauthorized',
            });
            return;
        }
        const config = await WebUiConfig.GetWebUIConfig();
        const credentialJson = await AuthHelper.validateCredentialWithinOneHour(config.token, Credential);
        if (credentialJson) {
            //通过验证
            next();
            return;
        }
        res.json({
            code: -1,
            msg: 'Unauthorized',
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
router.all('/test', (req, res) => {
    res.json({
        code: 0,
        msg: 'ok',
    });
});
router.use('/auth', AuthRouter);
router.use('/QQLogin', QQLoginRouter);
router.use('/OB11Config', OB11ConfigRouter);
export { router as ALLRouter };