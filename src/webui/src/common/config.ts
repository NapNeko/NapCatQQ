import { existsSync, readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";

const net = require('net');

async function tryUsePort(port: number) {
    function portUsed(port: number) {
        return new Promise((resolve, reject) => {
            let server = net.createServer().listen(port);
            server.on('listening', function () {
                server.close();
                resolve(port);
            });
            server.on('error', function (err: any) {
                if (err.code == 'EADDRINUSE') {
                    resolve(err);
                }
            });
        });
    }

    let res = await portUsed(port);
    if (res instanceof Error) {
        port++;
        return await tryUsePort(port);
    }
    return port;
}


//读取当前目录下名为 webui.json 的配置文件 如果不存在则创建初始化配置文件
export interface WebUiConfig {
    port: number;
}
export async function config(): Promise<WebUiConfig> {
    try {
        let config: WebUiConfig = {
            port: 6099,
        };
        if (!existsSync(resolve(__dirname, "./webui.json"))) {
            writeFileSync(resolve(__dirname, "./webui.json"), JSON.stringify(config, null, 4));
        }
        config = JSON.parse(readFileSync(resolve(__dirname, "./webui.json"), "utf-8")) as WebUiConfig;
        //修正端口占用情况
        config.port = await tryUsePort(config.port);
        return config;
    } catch (e) {
        //console.error("读取配置文件失败", e);
    }
    return {} as WebUiConfig;
}