import { RequestHandler } from 'express';
import { WebUiConfig } from '@/napcat-webui-backend/index';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';

// 获取WebUI基础配置
export const GetWebUIConfigHandler: RequestHandler = async (_, res) => {
  try {
    const config = await WebUiConfig.GetWebUIConfig();
    return sendSuccess(res, {
      host: config.host,
      port: config.port,
      loginRate: config.loginRate,
      disableWebUI: config.disableWebUI,
      accessControlMode: config.accessControlMode || 'none',
      ipWhitelist: config.ipWhitelist || [],
      ipBlacklist: config.ipBlacklist || [],
      enableXForwardedFor: config.enableXForwardedFor || false,
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

// 获取当前客户端IP
export const GetClientIPHandler: RequestHandler = async (req, res) => {
  try {
    const config = await WebUiConfig.GetWebUIConfig();

    // 根据配置决定如何获取客户端IP（与 CORS 中间件逻辑一致）
    let clientIP: string;
    if (config.enableXForwardedFor) {
      const forwardedFor = req.headers['x-forwarded-for'];
      if (typeof forwardedFor === 'string') {
        clientIP = forwardedFor.split(',')[0]?.trim() || '';
      } else if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
        clientIP = forwardedFor[0] || '';
      } else {
        clientIP = req.ip || req.socket.remoteAddress || '';
      }
    } else {
      clientIP = req.ip || req.socket.remoteAddress || '';
    }

    // 标准化 IP（移除 IPv4-mapped IPv6 前缀，但保留纯 IPv6）
    let normalizedIP = clientIP;
    if (clientIP.startsWith('::ffff:')) {
      const ipv4 = clientIP.substring(7);
      // 检查是否是有效的 IPv4
      if (/^\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}$/.test(ipv4)) {
        normalizedIP = ipv4;
      }
    }

    return sendSuccess(res, { ip: normalizedIP });
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `获取客户端IP失败: ${msg}`);
  }
};

// 更新WebUI基础配置
export const UpdateWebUIConfigHandler: RequestHandler = async (req, res) => {
  try {
    const { host, port, loginRate, disableWebUI, accessControlMode, ipWhitelist, ipBlacklist, enableXForwardedFor } = req.body;

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

    if (accessControlMode !== undefined) {
      if (!['none', 'whitelist', 'blacklist'].includes(accessControlMode)) {
        return sendError(res, 'accessControlMode必须是none、whitelist或blacklist');
      }
      updateConfig.accessControlMode = accessControlMode;
    }

    if (ipWhitelist !== undefined) {
      if (!Array.isArray(ipWhitelist)) {
        return sendError(res, 'ipWhitelist必须是数组');
      }
      updateConfig.ipWhitelist = ipWhitelist;
    }

    if (ipBlacklist !== undefined) {
      if (!Array.isArray(ipBlacklist)) {
        return sendError(res, 'ipBlacklist必须是数组');
      }
      updateConfig.ipBlacklist = ipBlacklist;
    }

    if (enableXForwardedFor !== undefined) {
      if (typeof enableXForwardedFor !== 'boolean') {
        return sendError(res, 'enableXForwardedFor必须是布尔值');
      }
      updateConfig.enableXForwardedFor = enableXForwardedFor;
    }

    await WebUiConfig.UpdateWebUIConfig(updateConfig);
    return sendSuccess(res, null);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(res, `更新WebUI配置失败: ${msg}`);
  }
};
