import path from 'node:path';
import fs from 'node:fs';
import type { NapCatCore } from '@/core';
import json5 from 'json5';
import Ajv, { AnySchema, ValidateFunction } from 'ajv';

export abstract class ConfigBase<T> {
    name: string;
    core: NapCatCore;
    configPath: string;
    configData: T = {} as T;
    ajv: Ajv;
    validate: ValidateFunction<T>;

    protected constructor(name: string, core: NapCatCore, configPath: string, ConfigSchema: AnySchema) {
        this.name = name;
        this.core = core;
        this.configPath = configPath;
        this.ajv = new Ajv({ useDefaults: true, coerceTypes: true });
        this.validate = this.ajv.compile<T>(ConfigSchema);
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
            let newConfigData = json5.parse(fs.readFileSync(configPath, 'utf-8'));
            this.validate(newConfigData);
            this.configData = newConfigData;
            this.core.context.logger.logDebug(`[Core] [Config] 配置文件${configPath}加载`, this.configData);
            return this.configData;
        } catch (e: unknown) {
            this.handleError(e, '读取配置文件时发生错误');
            return {} as T;
        }
    }

    save(newConfigData: T = this.configData): void {
        const configPath = this.getConfigPath(this.core.selfInfo.uin);
        this.validate(newConfigData);
        this.configData = newConfigData;
        try {
            fs.writeFileSync(configPath, JSON.stringify(this.configData, null, 2));
        } catch (e: unknown) {
            this.handleError(e, `保存配置文件 ${configPath} 时发生错误:`);
        }
    }

    private handleError(e: unknown, message: string): void {
        if (e instanceof SyntaxError) {
            this.core.context.logger.logError('[Core] [Config] 操作配置文件格式错误，请检查配置文件:', e.message);
        } else {
            this.core.context.logger.logError(`[Core] [Config] ${message}:`, (e as Error).message);
        }
    }
}