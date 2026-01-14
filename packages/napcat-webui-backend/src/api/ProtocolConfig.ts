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

  const pm = WebUiDataRuntime.getProtocolManager();
  const status: Record<string, boolean> = {};

  if (pm) {
    const protocols = pm.getRegisteredProtocols();
    for (const p of protocols) {
      status[p.id] = p.enabled;
    }
    return sendSuccess(res, status);
  }

  return sendError(res, 'ProtocolManager not ready');
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

// 获取指定协议配置
export const GetProtocolConfigHandler: RequestHandler = async (req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  const { name } = req.params;
  const uin = WebUiDataRuntime.getQQLoginUin();
  const protocolId = name === 'onebot11' ? 'onebot11' : name; // Normalize if needed

  const pm = WebUiDataRuntime.getProtocolManager();
  if (pm) {
    try {
      const config = await pm.getProtocolConfig(protocolId, uin);
      return sendSuccess(res, config);
    } catch (e) {
      return sendError(res, 'ProtocolManager Get Error: ' + e);
    }
  }

  return sendError(res, 'ProtocolManager not ready');
};

// 设置指定协议配置
export const SetProtocolConfigHandler: RequestHandler = async (req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  const { name } = req.params;
  const uin = WebUiDataRuntime.getQQLoginUin();
  const protocolId = name === 'onebot11' ? 'onebot11' : name;

  if (isEmpty(req.body.config)) {
    return sendError(res, 'config is empty');
  }

  try {
    const config = json5.parse(req.body.config);
    const pm = WebUiDataRuntime.getProtocolManager();

    if (pm) {
      await pm.setProtocolConfig(protocolId, uin, config);
      return sendSuccess(res, null);
    }

    return sendError(res, 'ProtocolManager not active');
  } catch (e) {
    return sendError(res, 'Error: ' + e);
  }
};

// 切换指定协议启用状态
export const ToggleProtocolHandler: RequestHandler = async (req, res) => {
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (!isLogin) {
    return sendError(res, 'Not Login');
  }

  const { name } = req.params;
  const protocolId = name === 'onebot11' ? 'onebot11' : name;
  const { enabled } = req.body;

  if (typeof enabled !== 'boolean') {
    return sendError(res, 'enabled param must be boolean');
  }

  try {
    const pm = WebUiDataRuntime.getProtocolManager();
    if (pm) {
      await pm.setProtocolEnabled(protocolId, enabled);
      return sendSuccess(res, null);
    }
    return sendError(res, 'ProtocolManager not ready');
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
