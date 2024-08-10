import path from 'node:path';
import fs from 'node:fs';
import type { NapCatCore } from '@/core';

export class ConfigBase<T> {
    public name: string = 'default_config';
    private pathName: string | null = null; // 本次读取的文件路径
    coreContext: NapCatCore;
    configPath: string;
    config: { [key: string]: any } = {};

    constructor(coreContext: NapCatCore, configPath: string) {
        this.coreContext = coreContext;
        this.configPath = configPath;
        this.read();
    }

    protected getKeys(): string[] | null {
        // 决定 key 在json配置文件中的顺序
        return null;
    }

    getConfigDir() {
        const configDir = path.resolve(this.configPath, 'config');
        fs.mkdirSync(configDir, { recursive: true });
        return configDir;
    }

    getConfigPath(pathName: string | null): string {
        const suffix = pathName ? `_${pathName}` : '';
        const filename = `${this.name}${suffix}.json`;
        return path.join(this.getConfigDir(), filename);
    }

    read() {
        // 尝试加载当前账号配置
        if (this.read_from_file(this.coreContext.selfInfo.uin, false)) return this;
        // 尝试加载默认配置
        return this.read_from_file('', true);
    }

    getConfig(): T {
        return this.config as T;
    }

    read_from_file(pathName: string, createIfNotExist: boolean) {
        const logger = this.coreContext.context.logger;
        const configPath = this.getConfigPath(pathName);
        if (!fs.existsSync(configPath)) {
            if (!createIfNotExist) return null;
            this.pathName = pathName; // 记录有效的设置文件
            try {
                fs.writeFileSync(configPath, JSON.stringify(this.config, this.getKeys(), 2));
                logger.log(`配置文件${configPath}已创建\n如果修改此文件后需要重启 NapCat 生效`);
            } catch (e: any) {
                logger.logError(`创建配置文件 ${configPath} 时发生错误:`, e.message);
            }
            return this.config;
        }

        try {
            this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            logger.logDebug(`配置文件${configPath}已加载`, this.config);
            // eslint-disable-next-line @typescript-eslint/ban-ts-comment
            this.save(); // 保存一次，让新版本的字段写入
            return this.config;
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                logger.logError(`配置文件 ${configPath} 格式错误，请检查配置文件:`, e.message);
            } else {
                logger.logError(`读取配置文件 ${configPath} 时发生错误:`, e.message);
            }
            return {};
        }
    }

    save(configData: T = this.config as T, overwrite: boolean = false) {
        const logger = this.coreContext.context.logger;
        const selfInfo = this.coreContext.selfInfo;
        if (overwrite) {
            // 用户要求强制写入，则变更当前文件为目标文件
            this.pathName = `${selfInfo.uin}`;
        }
        const configPath = this.getConfigPath(this.pathName);
        try {
            fs.writeFileSync(configPath, JSON.stringify(configData, this.getKeys(), 2));
        } catch (e: any) {
            logger.logError(`保存配置文件 ${configPath} 时发生错误:`, e.message);
        }
    }
}
