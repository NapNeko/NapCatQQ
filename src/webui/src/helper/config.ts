import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import * as net from 'node:net';
import { fileURLToPath } from 'node:url';


const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// 限制尝试端口的次数，避免死循环
const MAX_PORT_TRY = 100;

async function tryUseHost(host: string): Promise<string> {
    return new Promise(async (resolve, reject) => {
        try {
            const server = net.createServer();
            server.on('listening', () => {
                server.close();
                resolve(host);
            });

            server.on('error', (err: any) => {
                if (err.code === 'EADDRNOTAVAIL') {
                    reject('主机地址验证失败，可能为非本机地址');
                } else {
                    reject(`遇到错误: ${err.code}`);
                }
            });

            // 尝试监听 让系统随机分配一个端口
            server.listen(0, host);
        } catch (error) {
            // 这里捕获到的错误应该是启动服务器时的同步错误
            reject(`服务器启动时发生错误: ${error}`);
        }
    });
}

async function tryUsePort(port: number, host: string, tryCount: number = 0): Promise<number> {
    return new Promise(async (resolve, reject) => {
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
                        reject(`端口尝试失败，达到最大尝试次数: ${MAX_PORT_TRY}`);
                    }
                } else {
                    reject(`遇到错误: ${err.code}`);
                }
            });

            // 尝试监听端口
            server.listen(port, host);
        } catch (error) {
            // 这里捕获到的错误应该是启动服务器时的同步错误
            reject(`服务器启动时发生错误: ${error}`);
        }
    });
}

export interface WebUiConfigType {
    host: string;
    port: number;
    prefix: string;
    token: string;
    loginRate: number;
}

// 读取当前目录下名为 webui.json 的配置文件，如果不存在则创建初始化配置文件
class WebUiConfigWrapper {
    WebUiConfigData: WebUiConfigType | undefined = undefined;

    private applyDefaults<T>(obj: Partial<T>, defaults: T): T {
        return { ...defaults, ...obj };
    }

    async GetWebUIConfig(): Promise<WebUiConfigType> {
        if (this.WebUiConfigData) {
            return this.WebUiConfigData;
        }
        const defaultconfig: WebUiConfigType = {
            host: '0.0.0.0',
            port: 6099,
            prefix: '',
            token: '', // 默认先填空，空密码无法登录
            loginRate: 3,
        };
        try {
            defaultconfig.token = Math.random().toString(36).slice(2); //生成随机密码
        } catch (e) {
            console.log('随机密码生成失败', e);
        }
        try {
            const configPath = resolve(__dirname, './config/webui.json');

            if (!existsSync(configPath)) {
                writeFileSync(configPath, JSON.stringify(defaultconfig, null, 4));
            }

            const fileContent = readFileSync(configPath, 'utf-8');
            // 更新配置字段后新增字段可能会缺失，同步一下
            const parsedConfig = this.applyDefaults(JSON.parse(fileContent) as Partial<WebUiConfigType>, defaultconfig);

            if (!parsedConfig.prefix.startsWith('/')) parsedConfig.prefix = '/' + parsedConfig.prefix;
            if (parsedConfig.prefix.endsWith('/')) parsedConfig.prefix = parsedConfig.prefix.slice(0, -1);
            // 配置已经被操作过了，还是回写一下吧，不然新配置不会出现在配置文件里
            writeFileSync(configPath, JSON.stringify(parsedConfig, null, 4));
            // 不希望回写的配置放后面

            // 查询主机地址是否可用
            const [host_err, host] = await tryUseHost(parsedConfig.host).then(data => [null, data as string]).catch(err => [err, null]);
            if (host_err) {
                console.log('host不可用', host_err);
                parsedConfig.port = 0; // 设置为0，禁用WebUI
            } else {
                parsedConfig.host = host;
                // 修正端口占用情况
                const [port_err, port] = await tryUsePort(parsedConfig.port, parsedConfig.host).then(data => [null, data as number]).catch(err => [err, null]);
                if (port_err) {
                    console.log('port不可用', port_err);
                    parsedConfig.port = 0; // 设置为0，禁用WebUI
                } else {
                    parsedConfig.port = port;
                }
            }
            this.WebUiConfigData = parsedConfig;
            return this.WebUiConfigData;
        } catch (e) {
            console.log('读取配置文件失败', e);
        }
        return defaultconfig; // 理论上这行代码到不了，到了只能返回默认配置了
    }
}

export const WebUiConfig = new WebUiConfigWrapper();
