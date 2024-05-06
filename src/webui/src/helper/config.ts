import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
const net = require('net');

// 限制尝试端口的次数，避免死循环
const MAX_PORT_TRY = 100;

async function tryUsePort(port: number, tryCount: number = 0): Promise<number> {
    return new Promise((resolve, reject) => {
        let server = net.createServer().listen(port);
        server.on('listening', function () {
            server.close();
            resolve(port);
        });
        server.on('error', function (err: any) {
            if (err.code === 'EADDRINUSE' && tryCount < MAX_PORT_TRY) {
                resolve(tryUsePort(port + 1, tryCount + 1));
            } else if (err.code === 'EADDRINUSE' && tryCount >= MAX_PORT_TRY) {
                reject("端口尝试失败");
            } else {
                reject(err);
            }
        });
    });
}

export interface WebUiConfig {
    port: number;
    token: string;
    loginRate: number
}

// 读取当前目录下名为 webui.json 的配置文件，如果不存在则创建初始化配置文件
export async function WebUIConfig(): Promise<WebUiConfig> {
    try {
        let configPath = resolve(__dirname, "./webui.json");
        let config: WebUiConfig = {
            port: 6099,
            token: Math.random().toString(36).slice(2),//生成随机密码
            loginRate: 3
        };

        if (!existsSync(configPath)) {
            writeFileSync(configPath, JSON.stringify(config, null, 4));
        }

        let fileContent = readFileSync(configPath, "utf-8");
        let parsedConfig = JSON.parse(fileContent) as WebUiConfig;

        // 修正端口占用情况
        const [err, data] = await tryUsePort(parsedConfig.port).then(data => [null, data as number]).catch(err => [err, null]);
        if (err) {
            //一般没那么离谱 如果真有这么离谱 考虑下 向外抛出异常
        }
        return parsedConfig;
    } catch (e) {
        console.error("读取配置文件失败", e);
    }
    return {} as WebUiConfig; // 理论上这行代码到不了，为了保持函数完整性而保留
}