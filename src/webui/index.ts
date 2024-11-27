/**
 * @file WebUI服务入口文件
 */

import express from 'express';

import { LogWrapper } from '@/common/log';
import { NapCatPathWrapper } from '@/common/path';
import { RequestUtil } from '@/common/request';

import { WebUiConfigWrapper } from '@webapi/helper/config';
import { ALLRouter } from '@webapi/router';
import { cors } from '@webapi/middleware/cors';
import { createUrl } from '@webapi/utils/url';
import { sendSuccess } from '@webapi/utils/response';

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

export async function InitWebUi(logger: LogWrapper, pathWrapper: NapCatPathWrapper) {
    webUiPathWrapper = pathWrapper;
    WebUiConfig = new WebUiConfigWrapper();
    const log = logger.log.bind(logger);
    const config = await WebUiConfig.GetWebUIConfig();
    if (config.port == 0) {
        log('[NapCat] [WebUi] Current WebUi is not run.');
        return;
    }

    // ------------注册中间件------------
    // 使用express的json中间件
    app.use(express.json());

    // CORS中间件
    // TODO:
    app.use(cors);
    // ------------中间件结束------------

    // ------------挂载路由------------
    // 挂载静态路由（前端），路径为 [/前缀]/webui
    app.use(config.prefix + '/webui', express.static(pathWrapper.staticPath));
    // 挂载API接口
    app.use(config.prefix + '/api', ALLRouter);

    // 初始服务（先放个首页）
    // WebUI只在config.prefix所示路径上提供服务，可配合Nginx挂载到子目录中
    app.all(config.prefix + '/', (_req, res) => {
        sendSuccess(res, null, 'NapCat WebAPI is now running!');
    });
    // ------------路由挂载结束------------

    // ------------启动服务------------
    app.listen(config.port, config.host, async () => {
        // 启动后打印出相关地址

        const port = config.port.toString(),
            searchParams = { token: config.token },
            path = `${config.prefix}/webui`;

        // 打印日志（地址、token）
        log(`[NapCat] [WebUi] Current WebUi is running at http://${config.host}:${config.port}${config.prefix}`);
        log(`[NapCat] [WebUi] Login Token is ${config.token}`);
        log(`[NapCat] [WebUi] WebUi User Panel Url: ${createUrl(config.host, port, path, searchParams)}`);
        log(`[NapCat] [WebUi] WebUi Local Panel Url: ${createUrl('127.0.0.1', port, path, searchParams)}`);

        // 获取公网地址
        try {
            const publishUrl = 'https://ip.011102.xyz/';
            const data = await RequestUtil.HttpGetJson<{ IP: { IP: string } }>(publishUrl, 'GET', {}, {}, true, true);
            log(`[NapCat] [WebUi] WebUi Publish Panel Url: ${createUrl(data.IP.IP, port, path, searchParams)}`);
        } catch (err) {
            logger.logError(`[NapCat] [WebUi] Get Publish Panel Url Error: ${err}`);
        }
    });
    // ------------Over！------------
}
