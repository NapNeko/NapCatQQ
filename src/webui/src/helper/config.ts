import { webUiPathWrapper } from '@/webui';
import { Type, Static } from '@sinclair/typebox';
import Ajv from 'ajv';
import fs, { constants } from 'node:fs/promises';

import { resolve } from 'node:path';

import { deepMerge } from '../utils/object';
import { themeType } from '../types/theme';

// 限制尝试端口的次数，避免死循环

// 定义配置的类型
const WebUiConfigSchema = Type.Object({
    host: Type.String({ default: '0.0.0.0' }),
    port: Type.Number({ default: 6099 }),
    token: Type.String({ default: 'napcat' }),
    loginRate: Type.Number({ default: 10 }),
    autoLoginAccount: Type.String({ default: '' }),
    theme: themeType,
});

export type WebUiConfigType = Static<typeof WebUiConfigSchema>;

// 读取当前目录下名为 webui.json 的配置文件，如果不存在则创建初始化配置文件
export class WebUiConfigWrapper {
    WebUiConfigData: WebUiConfigType | undefined = undefined;

    private validateAndApplyDefaults(config: Partial<WebUiConfigType>): WebUiConfigType {
        new Ajv({ coerceTypes: true, useDefaults: true }).compile(WebUiConfigSchema)(config);
        return config as WebUiConfigType;
    }

    private async ensureConfigFileExists(configPath: string): Promise<void> {
        const configExists = await fs
            .access(configPath, constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (!configExists) {
            await fs.writeFile(configPath, JSON.stringify(this.validateAndApplyDefaults({}), null, 4));
        }
    }

    private async readAndValidateConfig(configPath: string): Promise<WebUiConfigType> {
        const fileContent = await fs.readFile(configPath, 'utf-8');
        return this.validateAndApplyDefaults(JSON.parse(fileContent));
    }

    private async writeConfig(configPath: string, config: WebUiConfigType): Promise<void> {
        const hasWritePermission = await fs
            .access(configPath, constants.W_OK)
            .then(() => true)
            .catch(() => false);
        if (hasWritePermission) {
            await fs.writeFile(configPath, JSON.stringify(config, null, 4));
        } else {
            console.warn(`文件: ${configPath} 没有写入权限, 配置的更改部分可能会在重启后还原.`);
        }
    }

    async GetWebUIConfig(): Promise<WebUiConfigType> {
        if (this.WebUiConfigData) {
            return this.WebUiConfigData;
        }
        try {
            const configPath = resolve(webUiPathWrapper.configPath, './webui.json');
            await this.ensureConfigFileExists(configPath);
            const parsedConfig = await this.readAndValidateConfig(configPath);
            this.WebUiConfigData = parsedConfig;
            return this.WebUiConfigData;
        } catch (e) {
            console.log('读取配置文件失败', e);
            return this.validateAndApplyDefaults({});
        }
    }

    async UpdateWebUIConfig(newConfig: Partial<WebUiConfigType>): Promise<void> {
        const configPath = resolve(webUiPathWrapper.configPath, './webui.json');
        const currentConfig = await this.GetWebUIConfig();
        const mergedConfig = deepMerge({ ...currentConfig }, newConfig);
        const updatedConfig = this.validateAndApplyDefaults(mergedConfig);
        await this.writeConfig(configPath, updatedConfig);
        this.WebUiConfigData = updatedConfig;
    }

    async UpdateToken(oldToken: string, newToken: string): Promise<void> {
        const currentConfig = await this.GetWebUIConfig();
        if (currentConfig.token !== oldToken) {
            throw new Error('旧 token 不匹配');
        }
        await this.UpdateWebUIConfig({ token: newToken });
    }

    // 获取日志文件夹路径
    async GetLogsPath(): Promise<string> {
        return resolve(webUiPathWrapper.logsPath);
    }

    // 获取日志列表
    async GetLogsList(): Promise<string[]> {
        const logsPath = resolve(webUiPathWrapper.logsPath);
        const logsExist = await fs
            .access(logsPath, constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (logsExist) {
            return (await fs.readdir(logsPath))
                .filter((file) => file.endsWith('.log'))
                .map((file) => file.replace('.log', ''));
        }
        return [];
    }

    // 获取指定日志文件内容
    async GetLogContent(filename: string): Promise<string> {
        const logPath = resolve(webUiPathWrapper.logsPath, `${filename}.log`);
        const logExists = await fs
            .access(logPath, constants.R_OK)
            .then(() => true)
            .catch(() => false);
        if (logExists) {
            return await fs.readFile(logPath, 'utf-8');
        }
        return '';
    }

    // 获取字体文件夹内的字体列表
    async GetFontList(): Promise<string[]> {
        const fontsPath = resolve(webUiPathWrapper.configPath, './fonts');
        const fontsExist = await fs
            .access(fontsPath, constants.F_OK)
            .then(() => true)
            .catch(() => false);
        if (fontsExist) {
            return (await fs.readdir(fontsPath)).filter((file) => file.endsWith('.ttf'));
        }
        return [];
    }

    // 判断字体是否存在（webui.woff）
    async CheckWebUIFontExist(): Promise<boolean> {
        const fontsPath = resolve(webUiPathWrapper.configPath, './fonts');
        return await fs
            .access(resolve(fontsPath, './webui.woff'), constants.F_OK)
            .then(() => true)
            .catch(() => false);
    }

    // 获取webui字体文件路径
    GetWebUIFontPath(): string {
        return resolve(webUiPathWrapper.configPath, './fonts/webui.woff');
    }

    getAutoLoginAccount(): string | undefined {
        return this.WebUiConfigData?.autoLoginAccount;
    }

    // 获取自动登录账号
    async GetAutoLoginAccount(): Promise<string> {
        return (await this.GetWebUIConfig()).autoLoginAccount;
    }

    // 更新自动登录账号
    async UpdateAutoLoginAccount(uin: string): Promise<void> {
        await this.UpdateWebUIConfig({ autoLoginAccount: uin });
    }

    // 获取主题内容
    async GetTheme(): Promise<WebUiConfigType['theme']> {
        const config = await this.GetWebUIConfig();

        return config.theme;
    }

    // 更新主题内容
    async UpdateTheme(theme: WebUiConfigType['theme']): Promise<void> {
        await this.UpdateWebUIConfig({ theme: theme });
    }
}
