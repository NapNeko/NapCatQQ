import { RequestHandler } from 'express';
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { resolve } from 'node:path';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import json5 from 'json5';

// NapCat 配置默认值
const defaultNapcatConfig = {
  fileLog: false,
  consoleLog: true,
  fileLogLevel: 'debug',
  consoleLogLevel: 'info',
  packetBackend: 'auto',
  packetServer: '',
  o3HookMode: 1,
  bypass: {
    hook: true,
    module: true,
    window: true,
    js: true,
    container: true,
    maps: true,
  },
};

/**
 * 获取 napcat 配置文件路径
 */
function getNapcatConfigPath (): string {
  return resolve(webUiPathWrapper.configPath, './napcat.json');
}

/**
 * 读取 napcat 配置
 */
function readNapcatConfig (): Record<string, unknown> {
  const configPath = getNapcatConfigPath();
  try {
    if (existsSync(configPath)) {
      const content = readFileSync(configPath, 'utf-8');
      return { ...defaultNapcatConfig, ...json5.parse(content) };
    }
  } catch (_e) {
    // 读取失败，使用默认值
  }
  return { ...defaultNapcatConfig };
}

/**
 * 写入 napcat 配置
 */
function writeNapcatConfig (config: Record<string, unknown>): void {
  const configPath = resolve(webUiPathWrapper.configPath, './napcat.json');
  mkdirSync(webUiPathWrapper.configPath, { recursive: true });
  writeFileSync(configPath, JSON.stringify(config, null, 2), 'utf-8');
}

// 获取 NapCat 配置
export const NapCatGetConfigHandler: RequestHandler = (_, res) => {
  try {
    const config = readNapcatConfig();
    return sendSuccess(res, config);
  } catch (e) {
    return sendError(res, 'Config Get Error: ' + (e as Error).message);
  }
};

// 设置 NapCat 配置
export const NapCatSetConfigHandler: RequestHandler = (req, res) => {
  try {
    const newConfig = req.body;
    if (!newConfig || typeof newConfig !== 'object') {
      return sendError(res, 'config is empty or invalid');
    }

    // 读取当前配置并合并
    const currentConfig = readNapcatConfig();
    const mergedConfig = { ...currentConfig, ...newConfig };

    // 验证 bypass 字段
    if (mergedConfig.bypass && typeof mergedConfig.bypass === 'object') {
      const bypass = mergedConfig.bypass as Record<string, unknown>;
      const validKeys = ['hook', 'module', 'window', 'js', 'container', 'maps'];
      for (const key of validKeys) {
        if (key in bypass && typeof bypass[key] !== 'boolean') {
          return sendError(res, `bypass.${key} must be boolean`);
        }
      }
    }

    writeNapcatConfig(mergedConfig);
    return sendSuccess(res, null);
  } catch (e) {
    return sendError(res, 'Config Set Error: ' + (e as Error).message);
  }
};
