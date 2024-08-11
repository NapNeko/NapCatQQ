import express from 'express';
import { resolve } from 'node:path';
import { ALLRouter } from './src/router';
import { LogWrapper } from '@/common/utils/log';
import { NapCatPathWrapper } from '@/common/framework/napcat';
import { WebUiConfigWrapper } from './src/helper/config';

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
    let log = logger.log;
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
    app.use(config.prefix + '/api', ALLRouter);
    app.listen(config.port, config.host, async () => {
        log(`[NapCat] [WebUi] Current WebUi is running at http://${config.host}:${config.port}${config.prefix}`);
        log(`[NapCat] [WebUi] Login URL is http://${config.host}:${config.port}${config.prefix}/webui`);
        log(`[NapCat] [WebUi] Login Token is ${config.token}`);
    });
}
