import express from 'express';
import { resolve } from 'node:path';
import { APIRouter } from './src/router';
const app = express();
/**
 * 初始化并启动WebUI服务。
 * 该函数配置了Express服务器以支持JSON解析和静态文件服务，并监听6099端口。
 * 无需参数。
 * @returns {Promise<void>} 无返回值。
 */
export async function InitWebUi() {
    app.use(express.json());
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
    app.listen(6099, async () => {
        //console.log(`WebUi is running at IP:6099`);
    })

}
