import express from 'express';
import { ALLRouter } from './src/router';
import { LogWrapper } from '@/common/log';
import { NapCatPathWrapper } from '@/common/path';
import { WebUiConfigWrapper } from './src/helper/config';
import { RequestUtil } from '@/common/request';
import { isIP } from "node:net";

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
    app.use(express.json());
    // 初始服务
    // WebUI只在config.prefix所示路径上提供服务，可配合Nginx挂载到子目录中
    app.all(config.prefix + '/', (_req, res) => {
        res.json({
            msg: 'NapCat WebAPI is now running!',
        });
    });
    // 配置静态文件服务，提供./static目录下的文件服务，访问路径为/webui
    app.use(config.prefix + '/webui', express.static(pathWrapper.staticPath));
    //挂载API接口
    // 添加CORS支持
    // TODO:
    app.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        next();
    });
    app.use(config.prefix + '/api', ALLRouter);
    app.listen(config.port, config.host, async () => {
        const normalizeHost = (host: string) => {
            if (host === '0.0.0.0') return '127.0.0.1';
            if (isIP(host) === 6) return `[${host}]`;
            return host;
        };
        const createUrl = (host: string, path: string, token: string) => {
            const url = new URL(`http://${normalizeHost(host)}`);
            url.port = config.port.toString();
            url.pathname = `${config.prefix}${path}`;
            url.searchParams.set('token', token);
            return url.toString();
        };
        log(`[NapCat] [WebUi] Current WebUi is running at http://${config.host}:${config.port}${config.prefix}`);
        log(`[NapCat] [WebUi] Login Token is ${config.token}`);
        log(`[NapCat] [WebUi] WebUi User Panel Url: ${createUrl(config.host, '/webui', config.token)}`);
        log(`[NapCat] [WebUi] WebUi Local Panel Url: ${createUrl('127.0.0.1', '/webui', config.token)}`);
        try {
            const publishUrl = 'https://ip.011102.xyz/';
            const data = await RequestUtil.HttpGetJson<{ IP: { IP: string } }>(publishUrl, 'GET', {}, {}, true, true);
            log("IP data", data);
            log(`[NapCat] [WebUi] WebUi Publish Panel Url: ${createUrl(data.IP.IP, '/webui', config.token)}`);
        } catch (err) {
            logger.logError(`[NapCat] [WebUi] Get Publish Panel Url Error: ${err}`);
        }
    });
}
