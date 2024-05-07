import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const net = require('net');

// 限制尝试端口的次数，避免死循环
const MAX_PORT_TRY = 100;

async function tryUsePort(port: number, tryCount: number = 0): Promise<number> {
    return new Promise(async (resolve, reject) => {
        try {
            let server = net.createServer();
            server.on('listening', () => {
                server.close();
                resolve(port);
            });

            server.on('error', (err: any) => {
                if (err.code === 'EADDRINUSE') {
                    if (tryCount < MAX_PORT_TRY) {
                        // 使用循环代替递归
                        resolve(tryUsePort(port + 1, tryCount + 1));
                    } else {
                        reject(`端口尝试失败，达到最大尝试次数: ${MAX_PORT_TRY}`);
                    }
                } else {
                    reject(`遇到错误: ${err.code}`);
                }
            });

            // 尝试监听端口
            server.listen(port);
        } catch (error) {
            // 这里捕获到的错误应该是启动服务器时的同步错误
            reject(`服务器启动时发生错误: ${error}`);
        }
    });
}

export interface WebUiConfigType {
    port: number;
    token: string;
    loginRate: number
}
async function GetWebUIConfig(): Promise<WebUiConfigType> {
    try {
        let configPath = resolve(__dirname, "./config/webui.json");
        let config: WebUiConfigType = {
            port: 6099,
            token: Math.random().toString(36).slice(2),//生成随机密码
            loginRate: 3
        };

        if (!existsSync(configPath)) {
            writeFileSync(configPath, JSON.stringify(config, null, 4));
        }

        let fileContent = readFileSync(configPath, "utf-8");
        let parsedConfig = JSON.parse(fileContent) as WebUiConfigType;

        // 修正端口占用情况
        const [err, data] = await tryUsePort(parsedConfig.port).then(data => [null, data as number]).catch(err => [err, null]);
        parsedConfig.port = data;
        if (err) {
            //一般没那么离谱 如果真有这么离谱 考虑下 向外抛出异常
        }
        return parsedConfig;
    } catch (e) {
        console.error("读取配置文件失败", e);
    }
    return {} as WebUiConfigType; // 理论上这行代码到不了，为了保持函数完整性而保留
}

// 读取当前目录下名为 webui.json 的配置文件，如果不存在则创建初始化配置文件
export const WebUiConfig = await GetWebUIConfig();