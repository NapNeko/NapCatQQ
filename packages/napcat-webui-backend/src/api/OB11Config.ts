import type { Context } from 'hono';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { loadConfig, OneBotConfig } from '@/napcat-webui-backend/src/onebot/config';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import json5 from 'json5';

// 获取OneBot11配置
export const OB11GetConfigHandler = (c: Context) => {
  // 获取QQ登录状态
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  // 如果未登录，返回错误
  if (!isLogin) {
    return sendError(c, 'Not Login');
  }
  // 获取登录的QQ号
  const uin = WebUiDataRuntime.getQQLoginUin();
  // 读取配置文件路径
  const configFilePath = resolve(webUiPathWrapper.configPath, `./onebot11_${uin}.json`);
  // 尝试解析配置文件
  try {
    // 读取配置文件内容
    const configFileContent = existsSync(configFilePath)
      ? readFileSync(configFilePath).toString()
      : readFileSync(resolve(webUiPathWrapper.configPath, './onebot11.json')).toString();
    // 解析配置文件并加载配置
    const data = loadConfig(json5.parse(configFileContent)) as OneBotConfig;
    // 返回配置文件
    return sendSuccess(c, data);
  } catch (_e) {
    return sendError(c, 'Config Get Error');
  }
};

// 写入OneBot11配置
export const OB11SetConfigHandler = async (c: Context) => {
  // 获取QQ登录状态
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  // 如果未登录，返回错误
  if (!isLogin) {
    return sendError(c, 'Not Login');
  }
  const body = await c.req.json().catch(() => ({}));
  const { config } = body as { config?: string };
  // 如果配置为空，返回错误
  if (isEmpty(config)) {
    return sendError(c, 'config is empty');
  }
  // 写入配置
  try {
    // 解析并加载配置
    const configObj = loadConfig(json5.parse(config || '')) as OneBotConfig;
    // 写入配置
    await WebUiDataRuntime.setOB11Config(configObj);
    return sendSuccess(c, null);
  } catch (e) {
    return sendError(c, 'Error: ' + e);
  }
};
