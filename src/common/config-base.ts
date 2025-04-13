import path from 'node:path';
import fs from 'node:fs';
import type { NapCatCore } from '@/core';
import json5 from 'json5';
import { z } from 'zod';

export abstract class ConfigBase<T> {
    name: string;
    core: NapCatCore;
    configPath: string;
    configData: T = {} as T;
    schema: z.ZodType<T>;

    protected constructor(name: string, core: NapCatCore, configPath: string, schema: z.ZodType<T>) {
        this.name = name;
        this.core = core;
        this.configPath = configPath;
        this.schema = schema;
        fs.mkdirSync(this.configPath, { recursive: true });
        this.read();
    }

    getConfigPath(pathName?: string): string {
        const filename = pathName ? `${this.name}_${pathName}.json` : `${this.name}.json`;
        return path.join(this.configPath, filename);
    }

    read(): T {
        const configPath = this.getConfigPath(this.core.selfInfo.uin);
        const defaultConfigPath = this.getConfigPath();
        if (!fs.existsSync(configPath)) {
            if (fs.existsSync(defaultConfigPath)) {
                this.configData = this.loadConfig(defaultConfigPath);
            }
            this.save();
            return this.configData;
        }
        return this.loadConfig(configPath);
    }

    private loadConfig(configPath: string): T {
        try {
            let configData = json5.parse(fs.readFileSync(configPath, 'utf-8'));
            const result = this.schema.safeParse(configData);

            if (result.success) {
                this.configData = result.data;
                this.core.context.logger.logDebug(`[Core] [Config] 配置文件${configPath}加载`, this.configData);
                return this.configData;
            } else {
                throw new Error(`配置文件验证失败: ${result.error.message}`);
            }
        } catch (e: unknown) {
            this.handleError(e, '读取配置文件时发生错误');
            return {} as T;
        }
    }

    save(newConfigData: T = this.configData): void {
        const configPath = this.getConfigPath(this.core.selfInfo.uin);
        try {
            const result = this.schema.safeParse(newConfigData);
            if (result.success) {
                this.configData = result.data;
                fs.writeFileSync(configPath, JSON.stringify(this.configData, null, 2));
            } else {
                throw new Error(`配置文件验证失败: ${result.error.message}`);
            }
        } catch (e: unknown) {
            this.handleError(e, `保存配置文件 ${configPath} 时发生错误:`);
        }
    }

    private handleError(e: unknown, message: string): void {
        if (e instanceof SyntaxError) {
            this.core.context.logger.logError('[Core] [Config] 操作配置文件格式错误，请检查配置文件:', e.message);
        } else if (e instanceof z.ZodError) {
            this.core.context.logger.logError('[Core] [Config] 配置文件验证错误:', e.message);
        } else {
            this.core.context.logger.logError(`[Core] [Config] ${message}:`, (e as Error).message);
        }
    }
}