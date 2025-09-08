/**
 * @file WebUI服务入口文件
 */

import express from 'express';
import { createServer } from 'http';
import { randomUUID } from 'node:crypto'
import { createServer as createHttpsServer } from 'https';
import { LogWrapper } from '@/common/log';
import { NapCatPathWrapper } from '@/common/path';
import { WebUiConfigWrapper } from '@webapi/helper/config';
import { ALLRouter } from '@webapi/router';
import { cors } from '@webapi/middleware/cors';
import { createUrl } from '@webapi/utils/url';
import { sendError } from '@webapi/utils/response';
import { join } from 'node:path';
import { terminalManager } from '@webapi/terminal/terminal_manager';
import multer from 'multer'; // 引入multer用于错误捕获

// 实例化Express
const app = express();
/**
 * 初始化并启动WebUI服务。
 * 该函数配置了Express服务器以支持JSON解析和静态文件服务，并监听6099端口。
 * 无需参数。
 * @returns {Promise<void>} 无返回值。
 */
export let WebUiConfig: WebUiConfigWrapper;
export let webUiPathWrapper: NapCatPathWrapper;
const MAX_PORT_TRY = 100;
import * as net from 'node:net';
import { WebUiDataRuntime } from './src/helper/Data';
import { existsSync, readFileSync } from 'node:fs';

export let webUiRuntimePort = 6099;
// 全局变量：存储需要在QQ登录成功后发送的新token
export let pendingTokenToSend: string | null = null;

/**
 * 存储WebUI启动时的初始token，用于鉴权
 * - 无论是否在运行时修改密码，都应该使用此token进行鉴权
 * - 运行时手动修改的密码将会在下次napcat重启后生效
 * - 如果需要在运行时修改密码并立即生效，则需要在前端调用路由进行修改
 */
let initialWebUiToken: string = '';

export function setInitialWebUiToken(token: string) {
    initialWebUiToken = token;
}

export function getInitialWebUiToken(): string {
    return initialWebUiToken;
}

export function setPendingTokenToSend(token: string | null) {
    pendingTokenToSend = token;
}

export async function InitPort(parsedConfig: WebUiConfigType): Promise<[string, number,string]> {
    try {
        await tryUseHost(parsedConfig.host);
        const port = await tryUsePort(parsedConfig.port, parsedConfig.host);
        return [parsedConfig.host, port, parsedConfig.token];
    } catch (error) {
        console.log('host或port不可用', error);
        return ['', 0, randomUUID()];
    }
}

async function checkCertificates(logger: LogWrapper): Promise<{ key: string, cert: string } | null> {
    try {
        const certPath = join(webUiPathWrapper.configPath, 'cert.pem');
        const keyPath = join(webUiPathWrapper.configPath, 'key.pem');

        if (existsSync(certPath) && existsSync(keyPath)) {
            const cert = readFileSync(certPath, 'utf8');
            const key = readFileSync(keyPath, 'utf8');
            logger.log('[NapCat] [WebUi] 找到SSL证书，将启用HTTPS模式');
            return { cert, key };
        }
        return null;
    } catch (error) {
        logger.log('[NapCat] [WebUi] 检查SSL证书时出错: ' + error);
        return null;
    }
}
export async function InitWebUi(logger: LogWrapper, pathWrapper: NapCatPathWrapper) {
    webUiPathWrapper = pathWrapper;
    WebUiConfig = new WebUiConfigWrapper();
    let config = await WebUiConfig.GetWebUIConfig();

    // 检查并更新默认密码 - 最高优先级
    if (config.defaultToken || config.token === 'napcat' || !config.token) {
        const randomToken = Math.random().toString(36).slice(-8);
        await WebUiConfig.UpdateWebUIConfig({ token: randomToken, defaultToken: false });
        logger.log(`[NapCat] [WebUi] 🔐 检测到默认密码，已自动更新为安全密码: ${randomToken}`);
        
        // 存储token到全局变量，等待QQ登录成功后发送
        setPendingTokenToSend(randomToken);
        logger.log(`[NapCat] [WebUi] 📤 新密码将在QQ登录成功后发送给用户`);
        
        // 重新获取更新后的配置
        config = await WebUiConfig.GetWebUIConfig();
    } else {
        logger.log(`[NapCat] [WebUi] ✅ 当前使用安全密码: ${config.token}`);
    }

    // 存储启动时的初始token用于鉴权
    setInitialWebUiToken(config.token);
    logger.log(`[NapCat] [WebUi] 🔑 已缓存启动时的token用于鉴权，运行时手动修改配置文件密码将不会生效`);

    // 检查是否禁用WebUI
    if (config.disableWebUI) {
        logger.log('[NapCat] [WebUi] WebUI is disabled by configuration.');
        return;
    }

    const [host, port, token] = await InitPort(config);
    webUiRuntimePort = port;
    if (port == 0) {
        logger.log('[NapCat] [WebUi] Current WebUi is not run.');
        return;
    }
    WebUiDataRuntime.setWebUiConfigQuickFunction(
        async () => {
            let autoLoginAccount = process.env['NAPCAT_QUICK_ACCOUNT'] || WebUiConfig.getAutoLoginAccount();
            if (autoLoginAccount) {
                try {
                    const { result, message } = await WebUiDataRuntime.requestQuickLogin(autoLoginAccount);
                    if (!result) {
                        throw new Error(message);
                    }
                    console.log(`[NapCat] [WebUi] Auto login account: ${autoLoginAccount}`);
                } catch (error) {
                    console.log(`[NapCat] [WebUi] Auto login account failed.` + error);
                }
            }
        });
    // ------------注册中间件------------
    // 使用express的json中间件
    app.use(express.json());

    // CORS中间件
    // TODO:
    app.use(cors);

    // 如果是webui字体文件，挂载字体文件
    app.use('/webui/fonts/AaCute.woff', async (_req, res, next) => {
        const isFontExist = await WebUiConfig.CheckWebUIFontExist();
        if (isFontExist) {
            res.sendFile(WebUiConfig.GetWebUIFontPath());
        } else {
            next();
        }
    });

    // 如果是自定义色彩，构建一个css文件
    app.use('/files/theme.css', async (_req, res) => {
        const colors = await WebUiConfig.GetTheme();

        let css = ':root, .light, [data-theme="light"] {';
        for (const key in colors.light) {
            css += `${key}: ${colors.light[key]};`;
        }
        css += '}';
        css += '.dark, [data-theme="dark"] {';
        for (const key in colors.dark) {
            css += `${key}: ${colors.dark[key]};`;
        }
        css += '}';

        res.send(css);
    });

    // ------------中间件结束------------

    // ------------挂载路由------------
    // 挂载静态路由（前端），路径为 /webui
    app.use('/webui', express.static(pathWrapper.staticPath, {
        maxAge: '1d'
    }));
    // 初始化WebSocket服务器
    const sslCerts = await checkCertificates(logger);
    const isHttps = !!sslCerts;
    let server = isHttps && sslCerts ? createHttpsServer(sslCerts, app) : createServer(app);
    server.on('upgrade', (request, socket, head) => {
        terminalManager.initialize(request, socket, head, logger);
    });
    // 挂载API接口
    app.use('/api', ALLRouter);
    // 所有剩下的请求都转到静态页面
    const indexFile = join(pathWrapper.staticPath, 'index.html');

    app.all(/\/webui\/(.*)/, (_req, res) => {
        res.sendFile(indexFile);
    });

    // 初始服务（先放个首页）
    app.all('/', (_req, res) => {
        res.status(301).header('Location', '/webui').send();
    });

    // 错误处理中间件，捕获multer的错误
    app.use((err: Error, _: express.Request, res: express.Response, next: express.NextFunction) => {
        if (err instanceof multer.MulterError) {
            return sendError(res, err.message, true);
        }
        next(err);
    });

    // 全局错误处理中间件（非multer错误）
    app.use((_: Error, __: express.Request, res: express.Response, ___: express.NextFunction) => {
        sendError(res, 'An unknown error occurred.', true);
    });

    // ------------启动服务------------
    server.listen(port, host, async () => {
        let searchParams = { token: token };
        logger.log(
            `[NapCat] [WebUi] WebUi User Panel Url: ${createUrl('127.0.0.1', port.toString(), '/webui', searchParams)}`
        );
        if (host !== '') {
            logger.log(
                `[NapCat] [WebUi] WebUi User Panel Url: ${createUrl(host, port.toString(), '/webui', searchParams)}`
            );
        }
    });

    // ------------Over！------------
}

async function tryUseHost(host: string): Promise<string> {
    return new Promise((resolve, reject) => {
        try {
            const server = net.createServer();
            server.on('listening', () => {
                server.close();
                resolve(host);
            });

            server.on('error', (err: any) => {
                if (err.code === 'EADDRNOTAVAIL') {
                    reject(new Error('主机地址验证失败，可能为非本机地址'));
                } else {
                    reject(new Error(`遇到错误: ${err.code}`));
                }
            });

            // 尝试监听 让系统随机分配一个端口
            server.listen(0, host);
        } catch (error) {
            // 这里捕获到的错误应该是启动服务器时的同步错误
            reject(new Error(`服务器启动时发生错误: ${error}`));
        }
    });
}

async function tryUsePort(port: number, host: string, tryCount: number = 0): Promise<number> {
    return new Promise((resolve, reject) => {
        try {
            const server = net.createServer();
            server.on('listening', () => {
                server.close();
                resolve(port);
            });

            server.on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    if (tryCount < MAX_PORT_TRY) {
                        // 使用循环代替递归
                        resolve(tryUsePort(port + 1, host, tryCount + 1));
                    } else {
                        reject(new Error(`端口尝试失败，达到最大尝试次数: ${MAX_PORT_TRY}`));
                    }
                } else {
                    reject(new Error(`遇到错误: ${err.code}`));
                }
            });

            // 尝试监听端口
            server.listen(port, host);
        } catch (error) {
            // 这里捕获到的错误应该是启动服务器时的同步错误
            reject(new Error(`服务器启动时发生错误: ${error}`));
        }
    });
}
