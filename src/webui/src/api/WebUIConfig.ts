import { RequestHandler } from 'express';
import { WebUiConfig } from '@/webui';
import { sendError, sendSuccess } from '@webapi/utils/response';
import { isEmpty } from '@webapi/utils/check';

// 获取WebUI基础配置
export const GetWebUIConfigHandler: RequestHandler = async (_, res) => {
  try {
    const config = await WebUiConfig.GetWebUIConfig();
    return sendSuccess(res, {
      host: config.host,
      port: config.port,
      loginRate: config.loginRate,
      disableWebUI: config.disableWebUI,
      disableNonLANAccess: config.disableNonLANAccess,
    });
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `获取WebUI配置失败: ${msg}`);
  }
};

// 获取是否禁用WebUI
export const GetDisableWebUIHandler: RequestHandler = async (_, res) => {
  try {
    const disable = await WebUiConfig.GetDisableWebUI();
    return sendSuccess(res, disable);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `获取WebUI禁用状态失败: ${msg}`);
  }
};

// 更新是否禁用WebUI
export const UpdateDisableWebUIHandler: RequestHandler = async (req, res) => {
  try {
    const { disable } = req.body;

    if (typeof disable !== 'boolean') {
      return sendError(res, 'disable参数必须是布尔值');
    }

    await WebUiConfig.UpdateDisableWebUI(disable);
    return sendSuccess(res, null);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `更新WebUI禁用状态失败: ${msg}`);
  }
};

// 获取是否禁用非局域网访问
export const GetDisableNonLANAccessHandler: RequestHandler = async (_, res) => {
  try {
    const disable = await WebUiConfig.GetDisableNonLANAccess();
    return sendSuccess(res, disable);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `获取非局域网访问禁用状态失败: ${msg}`);
  }
};

// 更新是否禁用非局域网访问
export const UpdateDisableNonLANAccessHandler: RequestHandler = async (req, res) => {
  try {
    const { disable } = req.body;

    if (typeof disable !== 'boolean') {
      return sendError(res, 'disable参数必须是布尔值');
    }

    await WebUiConfig.UpdateDisableNonLANAccess(disable);
    return sendSuccess(res, null);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `更新非局域网访问禁用状态失败: ${msg}`);
  }
};

// 更新WebUI基础配置
export const UpdateWebUIConfigHandler: RequestHandler = async (req, res) => {
  try {
    const { host, port, loginRate, disableWebUI, disableNonLANAccess } = req.body;

    const updateConfig: any = {};

    if (host !== undefined) {
      if (isEmpty(host)) {
        return sendError(res, 'host不能为空');
      }
      updateConfig.host = host;
    }

    if (port !== undefined) {
      if (!Number.isInteger(port) || port < 1 || port > 65535) {
        return sendError(res, 'port必须是1-65535之间的整数');
      }
      updateConfig.port = port;
    }

    if (loginRate !== undefined) {
      if (!Number.isInteger(loginRate) || loginRate < 1) {
        return sendError(res, 'loginRate必须是大于0的整数');
      }
      updateConfig.loginRate = loginRate;
    }

    if (disableWebUI !== undefined) {
      if (typeof disableWebUI !== 'boolean') {
        return sendError(res, 'disableWebUI必须是布尔值');
      }
      updateConfig.disableWebUI = disableWebUI;
    }

    if (disableNonLANAccess !== undefined) {
      if (typeof disableNonLANAccess !== 'boolean') {
        return sendError(res, 'disableNonLANAccess必须是布尔值');
      }
      updateConfig.disableNonLANAccess = disableNonLANAccess;
    }

    await WebUiConfig.UpdateWebUIConfig(updateConfig);
    return sendSuccess(res, null);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `更新WebUI配置失败: ${msg}`);
  }
};
