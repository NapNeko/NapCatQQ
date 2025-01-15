import path from 'node:path';
import fs from 'node:fs';
import type { NapCatCore } from '@/core';

export abstract class ConfigBase<T> {
    name: string;
    core: NapCatCore;
    configPath: string;
    configData: T = {} as T;

    protected constructor(name: string, core: NapCatCore, configPath: string, copy_default: boolean = true) {
        this.name = name;
        this.core = core;
        this.configPath = configPath;
        fs.mkdirSync(this.configPath, { recursive: true });
        this.read(copy_default);
    }

    protected getKeys(): string[] | null {
        // 决定 key 在json配置文件中的顺序
        return null;
    }

    getConfigPath(pathName: string | undefined): string {
        if (!pathName) {
            const filename = `${this.name}.json`;
            const mainPath = this.core.context.pathWrapper.binaryPath;
            return path.join(mainPath, 'config', filename);
        } else {
            const filename = `${this.name}_${pathName}.json`;
            return path.join(this.configPath, filename);
        }
    }

    read(copy_default: boolean = true): T {

        const configPath = this.getConfigPath(this.core.selfInfo.uin);
        if (!fs.existsSync(configPath) && copy_default) {
            try {
                fs.writeFileSync(configPath, fs.readFileSync(this.getConfigPath(undefined), 'utf-8'));
                this.core.context.logger.log(`[Core] [Config] 配置文件创建成功!\n`);
            } catch (e: any) {
                this.core.context.logger.logError(`[Core] [Config] 创建配置文件时发生错误:`, e.message);
            }
        } else if (!fs.existsSync(configPath) && !copy_default) {
            fs.writeFileSync(configPath, '{}');
        }
        try {
            this.configData = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
            this.core.context.logger.logDebug(`[Core] [Config] 配置文件${configPath}加载`, this.configData);
            return this.configData;
        } catch (e: any) {
            if (e instanceof SyntaxError) {
                this.core.context.logger.logError(`[Core] [Config] 配置文件格式错误，请检查配置文件:`, e.message);
            } else {
                this.core.context.logger.logError(`[Core] [Config] 读取配置文件时发生错误:`, e.message);
            }
            return {} as T;
        }
    }


    save(newConfigData: T = this.configData) {
        const selfInfo = this.core.selfInfo;
        this.configData = newConfigData;
        const configPath = this.getConfigPath(selfInfo.uin);
        try {
            fs.writeFileSync(configPath, JSON.stringify(newConfigData, this.getKeys(), 2));
        } catch (e: any) {
            this.core.context.logger.logError(`保存配置文件 ${configPath} 时发生错误:`, e.message);
        }
    }
}
