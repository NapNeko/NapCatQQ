import { webUiPathWrapper } from '@/webui';
import fs, { constants } from 'node:fs/promises';
import * as net from 'node:net';
import { resolve } from 'node:path';

// 限制尝试端口的次数，避免死循环
const MAX_PORT_TRY = 100;

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

// 读取当前目录下名为 webui.json 的配置文件，如果不存在则创建初始化配置文件
export class WebUiConfigWrapper {
    WebUiConfigData: WebUiConfigType | undefined = undefined;

    private applyDefaults<T>(obj: Partial<T>, defaults: T): T {
        const result = { ...defaults } as T;
        for (const key in obj) {
            if (obj[key] && typeof obj[key] === 'object' && !Array.isArray(obj[key])) {
                result[key] = this.applyDefaults(obj[key], defaults[key]);
            } else if (obj[key] !== undefined) {
                result[key] = obj[key] as T[Extract<keyof T, string>];
            }
        }
        return result;
    }

    async GetWebUIConfig(): Promise<WebUiConfigType> {
        if (this.WebUiConfigData) {
            return this.WebUiConfigData;
        }
        const defaultconfig: WebUiConfigType = {
            host: '0.0.0.0',
            port: 6099,
            token: '', // 默认先填空，空密码无法登录
            loginRate: 3,
        };
        try {
            defaultconfig.token = Math.random().toString(36).slice(2); //生成随机密码
        } catch (e) {
            console.log('随机密码生成失败', e);
        }
        try {
            const configPath = resolve(webUiPathWrapper.configPath, './webui.json');

            if (
                !(await fs
                    .access(configPath, constants.F_OK)
                    .then(() => true)
                    .catch(() => false))
            ) {
                await fs.writeFile(configPath, JSON.stringify(defaultconfig, null, 4));
            }

            const fileContent = await fs.readFile(configPath, 'utf-8');
            const parsedConfig = this.applyDefaults(JSON.parse(fileContent) as Partial<WebUiConfigType>, defaultconfig);

            if (
                await fs
                    .access(configPath, constants.W_OK)
                    .then(() => true)
                    .catch(() => false)
            ) {
                await fs.writeFile(configPath, JSON.stringify(parsedConfig, null, 4));
            } else {
                console.warn(`文件: ${configPath} 没有写入权限, 配置的更改部分可能会在重启后还原.`);
            }

            const [host_err, host] = await tryUseHost(parsedConfig.host)
                .then((data) => [null, data])
                .catch((err) => [err, null]);
            if (host_err) {
                console.log('host不可用', host_err);
                parsedConfig.port = 0; // 设置为0，禁用WebUI
            } else {
                parsedConfig.host = host;
                const [port_err, port] = await tryUsePort(parsedConfig.port, parsedConfig.host)
                    .then((data) => [null, data])
                    .catch((err) => [err, null]);
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

    async UpdateWebUIConfig(newConfig: Partial<WebUiConfigType>): Promise<void> {
        const configPath = resolve(webUiPathWrapper.configPath, './webui.json');
        const currentConfig = await this.GetWebUIConfig();
        const updatedConfig = this.applyDefaults(newConfig, currentConfig);

        if (
            await fs
                .access(configPath, constants.W_OK)
                .then(() => true)
                .catch(() => false)
        ) {
            await fs.writeFile(configPath, JSON.stringify(updatedConfig, null, 4));
            this.WebUiConfigData = updatedConfig;
        } else {
            console.warn(`文件: ${configPath} 没有写入权限, 配置的更改部分可能会在重启后还原.`);
        }
    }

    async UpdateToken(oldToken: string, newToken: string): Promise<void> {
        const currentConfig = await this.GetWebUIConfig();
        if (currentConfig.token !== oldToken) {
            throw new Error('旧 token 不匹配');
        }
        await this.UpdateWebUIConfig({ token: newToken });
    }

    // 获取日志文件夹路径
    public static async GetLogsPath(): Promise<string> {
        return resolve(webUiPathWrapper.logsPath);
    }
    // 获取日志列表
    public static async GetLogsList(): Promise<string[]> {
        if (
            await fs
                .access(webUiPathWrapper.logsPath, constants.F_OK)
                .then(() => true)
                .catch(() => false)
        ) {
            return (await fs.readdir(webUiPathWrapper.logsPath))
                .filter((file) => file.endsWith('.log'))
                .map((file) => file.replace('.log', ''));
        }
        return [];
    }
    // 获取指定日志文件内容
    public static async GetLogContent(filename: string): Promise<string> {
        const logPath = resolve(webUiPathWrapper.logsPath, `${filename}.log`);
        if (
            await fs
                .access(logPath, constants.R_OK)
                .then(() => true)
                .catch(() => false)
        ) {
            return await fs.readFile(logPath, 'utf-8');
        }
        return '';
    }

    // 获取字体文件夹内的字体列表
    public static async GetFontList(): Promise<string[]> {
        const fontsPath = resolve(webUiPathWrapper.configPath, './fonts');
        if (
            await fs
                .access(fontsPath, constants.F_OK)
                .then(() => true)
                .catch(() => false)
        ) {
            return (await fs.readdir(fontsPath)).filter((file) => file.endsWith('.ttf'));
        }
        return [];
    }

    // 判断字体是否存在（webui.woff）
    public static async CheckWebUIFontExist(): Promise<boolean> {
        const fontsPath = resolve(webUiPathWrapper.configPath, './fonts');
        return await fs
            .access(resolve(fontsPath, './webui.woff'), constants.F_OK)
            .then(() => true)
            .catch(() => false);
    }

    // 获取webui字体文件路径
    public static GetWebUIFontPath(): string {
        return resolve(webUiPathWrapper.configPath, './fonts/webui.woff');
    }
}
