import path from 'node:path';
import fs from 'node:fs';
import type { NapCatCore } from '@/core';

export abstract class ConfigBase<T> {
    abstract name: string;
    coreContext: NapCatCore;
    configPath: string;
    configData: T = {} as T;

    constructor(coreContext: NapCatCore, configPath: string) {
        this.coreContext = coreContext;
        this.configPath = configPath;
        fs.mkdirSync(this.configPath, { recursive: true });
        this.read();
    }

    protected getKeys(): string[] | null {
        // 决定 key 在json配置文件中的顺序
        return null;
    }

    getConfigPath(pathName: string | undefined): string {
        const suffix = pathName ? `_${pathName}` : '';
        const filename = `${this.name}${suffix}.json`;
        return path.join(this.configPath, filename);
    }

    read(): T {
        const logger = this.coreContext.context.logger;
        const configPath = this.getConfigPath(this.coreContext.selfInfo.uin);
        if (!fs.existsSync(configPath)) {
            try {
                fs.writeFileSync(configPath, fs.readFileSync(this.getConfigPath(undefined), 'utf-8'));
                logger.log(`配置文件${configPath}创建成功!\n`);
            } catch (e: any) {
                logger.logError(`创建配置文件 ${configPath} 时发生错误:`, e.message);
            }
        }
        try {
            this.configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            logger.logDebug(`配置文件${configPath}已加载`, this.configData);
            return this.configData;
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                logger.logError(`配置文件 ${configPath} 格式错误，请检查配置文件:`, e.message);
            } else {
                logger.logError(`读取配置文件 ${configPath} 时发生错误:`, e.message);
            }
            return {} as T;
        }
    }


    save(configData: T = this.configData as T) {
        const logger = this.coreContext.context.logger;
        const selfInfo = this.coreContext.selfInfo;
        const configPath = this.getConfigPath(selfInfo.uin);
        try {
            fs.writeFileSync(configPath, JSON.stringify(configData, this.getKeys(), 2));
        } catch (e: any) {
            logger.logError(`保存配置文件 ${configPath} 时发生错误:`, e.message);
        }
    }
}
