import { RequestHandler } from 'express';
import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { webUiPathWrapper } from '@/napcat-webui-backend/index';
import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import json5 from 'json5';
import { getSupportedProtocols } from 'napcat-common/src/protocol';

// 获取支持的协议列表
export const GetSupportedProtocolsHandler: RequestHandler = (_req, res) => {
  const protocols = getSupportedProtocols();
  return sendSuccess(res, protocols);
};

// 获取协议启用状态
export const GetProtocolStatusHandler: RequestHandler = (_req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  const uin = WebUiDataRuntime.getQQLoginUin();
  const protocols = getSupportedProtocols();
  const status: Record<string, boolean> = {};

  for (const protocol of protocols) {
    const configPath = resolve(
      webUiPathWrapper.configPath,
      `./${protocol.id}_${uin}.json`
    );

    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        const config = json5.parse(content);
        // 检查是否有任何网络配置启用
        const network = config.network || {};
        const hasEnabled = Object.values(network).some((arr: any) =>
          Array.isArray(arr) && arr.some((item: any) => item.enable)
        );
        status[protocol.id] = hasEnabled;
      } catch {
        status[protocol.id] = false;
      }
    } else {
      status[protocol.id] = protocol.id === 'onebot11'; // OneBot11 默认启用
    }
  }

  return sendSuccess(res, status);
};

// 获取 Satori 配置
export const SatoriGetConfigHandler: RequestHandler = (_req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  const uin = WebUiDataRuntime.getQQLoginUin();
  const configFilePath = resolve(webUiPathWrapper.configPath, `./satori_${uin}.json`);

  try {
    let configData: any = {
      network: {
        websocketServers: [],
        httpServers: [],
        webhookClients: [],
      },
      platform: 'qq',
      selfId: uin,
    };

    if (existsSync(configFilePath)) {
      const content = readFileSync(configFilePath, 'utf-8');
      configData = json5.parse(content);
    }

    return sendSuccess(res, configData);
  } catch (e) {
    return sendError(res, 'Config Get Error: ' + e);
  }
};

// 写入 Satori 配置
export const SatoriSetConfigHandler: RequestHandler = async (req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  if (isEmpty(req.body.config)) {
    return sendError(res, 'config is empty');
  }

  try {
    const config = json5.parse(req.body.config);
    await WebUiDataRuntime.setSatoriConfig(config);
    return sendSuccess(res, null);
  } catch (e) {
    return sendError(res, 'Error: ' + e);
  }
};

// 获取所有协议配置
export const GetAllProtocolConfigsHandler: RequestHandler = (_req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  const uin = WebUiDataRuntime.getQQLoginUin();
  const protocols = getSupportedProtocols();
  const configs: Record<string, any> = {};

  for (const protocol of protocols) {
    const configPath = resolve(
      webUiPathWrapper.configPath,
      `./${protocol.id === 'onebot11' ? 'onebot11' : protocol.id}_${uin}.json`
    );

    if (existsSync(configPath)) {
      try {
        const content = readFileSync(configPath, 'utf-8');
        configs[protocol.id] = json5.parse(content);
      } catch {
        configs[protocol.id] = null;
      }
    } else {
      configs[protocol.id] = null;
    }
  }

  return sendSuccess(res, configs);
};
