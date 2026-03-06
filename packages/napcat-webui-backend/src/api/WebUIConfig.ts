import type { Context } from 'hono';
import { WebUiConfig, webUiPathWrapper } from '@/napcat-webui-backend/index';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import { existsSync, promises as fsProm } from 'node:fs';
import { join } from 'node:path';
import { getClientIP } from '@/napcat-webui-backend/src/middleware/cors';

// 获取WebUI基础配置
export const GetWebUIConfigHandler = async (c: Context) => {
  try {
    const config = await WebUiConfig.GetWebUIConfig();
    return sendSuccess(c, {
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
    return sendError(c, `获取WebUI配置失败: ${msg}`);
  }
};

// 获取是否禁用WebUI
export const GetDisableWebUIHandler = async (c: Context) => {
  try {
    const disable = await WebUiConfig.GetDisableWebUI();
    return sendSuccess(c, disable);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `获取WebUI禁用状态失败: ${msg}`);
  }
};

// 更新是否禁用WebUI
export const UpdateDisableWebUIHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { disable } = body as { disable?: boolean };

    if (typeof disable !== 'boolean') {
      return sendError(c, 'disable参数必须是布尔值');
    }

    await WebUiConfig.UpdateDisableWebUI(disable);
    return sendSuccess(c, null);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `更新WebUI禁用状态失败: ${msg}`);
  }
};

// 获取当前客户端IP
export const GetClientIPHandler = async (c: Context) => {
  try {
    const config = await WebUiConfig.GetWebUIConfig();

    // 根据配置决定如何获取客户端IP（与 CORS 中间件逻辑一致）
    let clientIP: string;
    if (config.enableXForwardedFor) {
      const forwardedFor = c.req.header('x-forwarded-for');
      if (typeof forwardedFor === 'string') {
        clientIP = forwardedFor.split(',')[0]?.trim() || '';
      } else {
        clientIP = getClientIP(c);
      }
    } else {
      clientIP = getClientIP(c);
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

    return sendSuccess(c, { ip: normalizedIP });
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `获取客户端IP失败: ${msg}`);
  }
};

// 更新WebUI基础配置
export const UpdateWebUIConfigHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const bodyObj = body as Record<string, unknown>;
    const host = bodyObj['host'];
    const port = bodyObj['port'];
    const loginRate = bodyObj['loginRate'];
    const disableWebUI = bodyObj['disableWebUI'];
    const accessControlMode = bodyObj['accessControlMode'];
    const ipWhitelist = bodyObj['ipWhitelist'];
    const ipBlacklist = bodyObj['ipBlacklist'];
    const enableXForwardedFor = bodyObj['enableXForwardedFor'];

    const updateConfig: Record<string, unknown> = {};

    if (host !== undefined) {
      if (isEmpty(host as string)) {
        return sendError(c, 'host不能为空');
      }
      updateConfig['host'] = host;
    }

    if (port !== undefined) {
      if (!Number.isInteger(port) || (port as number) < 1 || (port as number) > 65535) {
        return sendError(c, 'port必须是1-65535之间的整数');
      }
      updateConfig['port'] = port;
    }

    if (loginRate !== undefined) {
      if (!Number.isInteger(loginRate) || (loginRate as number) < 1) {
        return sendError(c, 'loginRate必须是大于0的整数');
      }
      updateConfig['loginRate'] = loginRate;
    }

    if (disableWebUI !== undefined) {
      if (typeof disableWebUI !== 'boolean') {
        return sendError(c, 'disableWebUI必须是布尔值');
      }
      updateConfig['disableWebUI'] = disableWebUI;
    }

    if (accessControlMode !== undefined) {
      if (!['none', 'whitelist', 'blacklist'].includes(accessControlMode as string)) {
        return sendError(c, 'accessControlMode必须是none、whitelist或blacklist');
      }
      updateConfig['accessControlMode'] = accessControlMode;
    }

    if (ipWhitelist !== undefined) {
      if (!Array.isArray(ipWhitelist)) {
        return sendError(c, 'ipWhitelist必须是数组');
      }
      updateConfig['ipWhitelist'] = ipWhitelist;
    }

    if (ipBlacklist !== undefined) {
      if (!Array.isArray(ipBlacklist)) {
        return sendError(c, 'ipBlacklist必须是数组');
      }
      updateConfig['ipBlacklist'] = ipBlacklist;
    }

    if (enableXForwardedFor !== undefined) {
      if (typeof enableXForwardedFor !== 'boolean') {
        return sendError(c, 'enableXForwardedFor必须是布尔值');
      }
      updateConfig['enableXForwardedFor'] = enableXForwardedFor;
    }

    await WebUiConfig.UpdateWebUIConfig(updateConfig);
    return sendSuccess(c, null);
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `更新WebUI配置失败: ${msg}`);
  }
};

// 获取SSL证书状态
export const GetSSLStatusHandler = async (c: Context) => {
  try {
    const certPath = join(webUiPathWrapper.configPath, 'cert.pem');
    const keyPath = join(webUiPathWrapper.configPath, 'key.pem');

    const certExists = existsSync(certPath);
    const keyExists = existsSync(keyPath);

    let certContent = '';
    let keyContent = '';

    if (certExists) {
      certContent = await fsProm.readFile(certPath, 'utf-8');
    }
    if (keyExists) {
      keyContent = await fsProm.readFile(keyPath, 'utf-8');
    }

    return sendSuccess(c, {
      enabled: certExists && keyExists,
      certExists,
      keyExists,
      certContent,
      keyContent,
    });
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `获取SSL状态失败: ${msg}`);
  }
};

// 保存SSL证书（通过文本内容）
export const UploadSSLCertHandler = async (c: Context) => {
  try {
    const body = await c.req.json().catch(() => ({}));
    const { cert, key } = body as { cert?: string; key?: string };

    if (isEmpty(cert) || isEmpty(key)) {
      return sendError(c, 'cert和key内容不能为空');
    }

    // 简单验证证书格式
    if (!cert!.includes('-----BEGIN CERTIFICATE-----') || !cert!.includes('-----END CERTIFICATE-----')) {
      return sendError(c, 'cert格式不正确，应为PEM格式的证书');
    }

    if (!key!.includes('-----BEGIN') || !key!.includes('KEY-----')) {
      return sendError(c, 'key格式不正确，应为PEM格式的私钥');
    }

    const certPath = join(webUiPathWrapper.configPath, 'cert.pem');
    const keyPath = join(webUiPathWrapper.configPath, 'key.pem');

    await fsProm.writeFile(certPath, cert!, 'utf-8');
    await fsProm.writeFile(keyPath, key!, 'utf-8');

    return sendSuccess(c, { message: 'SSL证书保存成功，重启后生效' });
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `保存SSL证书失败: ${msg}`);
  }
};

// 删除SSL证书
export const DeleteSSLCertHandler = async (c: Context) => {
  try {
    const certPath = join(webUiPathWrapper.configPath, 'cert.pem');
    const keyPath = join(webUiPathWrapper.configPath, 'key.pem');

    if (existsSync(certPath)) {
      await fsProm.unlink(certPath);
    }
    if (existsSync(keyPath)) {
      await fsProm.unlink(keyPath);
    }

    return sendSuccess(c, { message: 'SSL证书已删除，重启后生效' });
  } catch (error) {
    const msg = (error as Error).message;
    return sendError(c, `删除SSL证书失败: ${msg}`);
  }
};
