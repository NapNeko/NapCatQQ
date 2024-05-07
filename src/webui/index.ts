import express from 'express';
import { NextFunction, Request, Response } from 'express';
import { AuthHelper } from './src/helper/SignToken';
import { resolve } from 'node:path';
import { APIRouter } from './src/router';
import { WebUIConfig } from './src/helper/config';
const app = express();
/**
 * 初始化并启动WebUI服务。
 * 该函数配置了Express服务器以支持JSON解析和静态文件服务，并监听6099端口。
 * 无需参数。
 * @returns {Promise<void>} 无返回值。
 */
export async function InitWebUi() {
    let config = await WebUIConfig();
    app.use(express.json());
    app.use(AuthApi);
    // 初始服务
    app.all('/', (_req, res) => {
        res.json({
            msg: 'NapCat WebAPI is now running!',
        });
    });
    // 配置静态文件服务，提供./static目录下的文件服务，访问路径为/webui
    app.use('/webui', express.static(resolve(__dirname, './static')));
    //挂载API接口
    app.all('/api', APIRouter);
    app.listen(config.port, async () => {
        console.log(`[NapCat] [WebUi] Current WebUi is running at IP:${config.port}`);
    })

}
export async function AuthApi(req: Request, res: Response, next: NextFunction) {
    //判断当前url是否为/api/login 如果是跳过鉴权
    try {
        if (req.url == '/api/login') {
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
    return;
}