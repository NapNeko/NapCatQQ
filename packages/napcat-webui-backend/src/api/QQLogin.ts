import type { Context } from 'hono';
import https from 'https';

import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { WebUiConfig } from '@/napcat-webui-backend/index';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { Registry20Utils, MachineInfoUtils } from '@/napcat-webui-backend/src/utils/guid';
import os from 'node:os';

// oidb 新设备验证请求辅助函数
function oidbRequest (uid: string, body: Record<string, unknown>): Promise<Record<string, unknown>> {
  return new Promise((resolve, reject) => {
    const postData = JSON.stringify(body);
    const req = https.request({
      hostname: 'oidb.tim.qq.com',
      path: `/v3/oidbinterface/oidb_0xc9e_8?uid=${encodeURIComponent(uid)}&getqrcode=1&sdkappid=39998&actype=2`,
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(postData),
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
        Accept: 'application/json, text/plain, */*',
      },
    }, (res) => {
      let data = '';
      res.on('data', (chunk) => { data += chunk; });
      res.on('end', () => {
        try {
          resolve(JSON.parse(data));
        } catch {
          reject(new Error('Failed to parse oidb response'));
        }
      });
    });
    req.on('error', reject);
    req.write(postData);
    req.end();
  });
}

// 获取 Registry20 路径的辅助函数
const getRegistryPath = () => {
  // 优先从 WebUiDataRuntime 获取早期设置的 dataPath
  let dataPath = WebUiDataRuntime.getQQDataPath();
  if (!dataPath) {
    // 回退: 从 OneBotContext 获取
    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    dataPath = oneBotContext?.core?.dataPath;
  }
  if (!dataPath) {
    throw new Error('QQ data path not available yet');
  }
  return Registry20Utils.getRegistryPath(dataPath);
};

// 获取 machine-info 路径的辅助函数 (Linux)
const getMachineInfoPath = () => {
  let dataPath = WebUiDataRuntime.getQQDataPath();
  if (!dataPath) {
    const oneBotContext = WebUiDataRuntime.getOneBotContext();
    dataPath = oneBotContext?.core?.dataPath;
  }
  if (!dataPath) {
    throw new Error('QQ data path not available yet');
  }
  return MachineInfoUtils.getMachineInfoPath(dataPath);
};

// 获取QQ登录二维码
export const QQGetQRcodeHandler = async (c: Context) => {
  // 判断是否已经登录
  if (WebUiDataRuntime.getQQLoginStatus()) {
    // 已经登录
    return sendError(c, 'QQ Is Logined');
  }
  // 获取二维码
  const qrcodeUrl = WebUiDataRuntime.getQQLoginQrcodeURL();
  // 判断二维码是否为空
  if (isEmpty(qrcodeUrl)) {
    return sendError(c, 'QRCode Get Error');
  }
  // 返回二维码URL
  const data = {
    qrcode: qrcodeUrl,
  };
  return sendSuccess(c, data);
};

// 获取QQ登录状态
export const QQCheckLoginStatusHandler = async (c: Context) => {
  // 从 OneBot 上下文获取实时的 selfInfo.online 状态
  const oneBotContext = WebUiDataRuntime.getOneBotContext();
  const selfInfo = oneBotContext?.core?.selfInfo;
  const isOnline = selfInfo?.online;
  const qqLoginStatus = WebUiDataRuntime.getQQLoginStatus();
  // 必须同时满足：已登录且在线（online 必须明确为 true）
  const isLogin = qqLoginStatus && isOnline === true;
  // 检测掉线状态：已登录但不在线
  const isOffline = qqLoginStatus && isOnline === false;
  const data = {
    isLogin,
    isOffline,
    qrcodeurl: WebUiDataRuntime.getQQLoginQrcodeURL(),
    loginError: WebUiDataRuntime.getQQLoginError(),
  };
  return sendSuccess(c, data);
};

// 快速登录
export const QQSetQuickLoginHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin } = body as { uin?: string };
  // 判断是否已经登录
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(c, 'QQ Is Logined');
  }
  // 判断QQ号是否为空
  if (isEmpty(uin)) {
    return sendError(c, 'uin is empty');
  }

  // 获取快速登录状态
  const { result, message } = await WebUiDataRuntime.requestQuickLogin(uin!);
  if (!result) {
    return sendError(c, message);
  }
  return sendSuccess(c, null);
};

// 获取快速登录列表
export const QQGetQuickLoginListHandler = async (c: Context) => {
  const quickLoginList = WebUiDataRuntime.getQQQuickLoginList();
  return sendSuccess(c, quickLoginList);
};

// 获取快速登录列表（新）
export const QQGetLoginListNewHandler = async (c: Context) => {
  const newLoginList = WebUiDataRuntime.getQQNewLoginList();
  return sendSuccess(c, newLoginList);
};

// 获取登录的QQ的信息
export const getQQLoginInfoHandler = async (c: Context) => {
  const basicInfo = WebUiDataRuntime.getQQLoginInfo();
  // 从 OneBot 上下文获取实时的 selfInfo.online 状态
  const oneBotContext = WebUiDataRuntime.getOneBotContext();
  const selfInfo = oneBotContext?.core?.selfInfo;
  const online = selfInfo?.online ?? undefined;
  const avatarUrl = selfInfo?.avatarUrl;
  const data = {
    ...basicInfo,
    online,
    avatarUrl,
  };
  return sendSuccess(c, data);
};

// 获取自动登录QQ账号
export const getAutoLoginAccountHandler = async (c: Context) => {
  const data = WebUiConfig.getAutoLoginAccount();
  return sendSuccess(c, data);
};

// 设置自动登录QQ账号
export const setAutoLoginAccountHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin } = body as { uin?: string };
  await WebUiConfig.UpdateAutoLoginAccount(uin ?? '');
  return sendSuccess(c, null);
};

// 刷新QQ登录二维码
export const QQRefreshQRcodeHandler = async (c: Context) => {
  // 判断是否已经登录
  if (WebUiDataRuntime.getQQLoginStatus()) {
    // 已经登录
    return sendError(c, 'QQ Is Logined');
  }
  // 刷新二维码
  await WebUiDataRuntime.refreshQRCode();
  return sendSuccess(c, null);
};

// 密码登录
export const QQPasswordLoginHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin, passwordMd5 } = body as { uin?: string; passwordMd5?: string };
  // 判断是否已经登录
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(c, 'QQ Is Logined');
  }
  // 判断QQ号是否为空
  if (isEmpty(uin)) {
    return sendError(c, 'uin is empty');
  }
  // 判断密码MD5是否为空
  if (isEmpty(passwordMd5)) {
    return sendError(c, 'passwordMd5 is empty');
  }

  // 执行密码登录
  const { result, message, needCaptcha, proofWaterUrl, needNewDevice, jumpUrl, newDevicePullQrCodeSig } = await WebUiDataRuntime.requestPasswordLogin(uin!, passwordMd5!);
  if (!result) {
    if (needCaptcha && proofWaterUrl) {
      return sendSuccess(c, { needCaptcha: true, proofWaterUrl });
    }
    if (needNewDevice && jumpUrl) {
      return sendSuccess(c, { needNewDevice: true, jumpUrl, newDevicePullQrCodeSig });
    }
    return sendError(c, message);
  }
  return sendSuccess(c, null);
};

// 验证码登录（密码登录需要验证码时的第二步）
export const QQCaptchaLoginHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin, passwordMd5, ticket, randstr, sid } = body as { uin?: string; passwordMd5?: string; ticket?: string; randstr?: string; sid?: string };
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(c, 'QQ Is Logined');
  }
  if (isEmpty(uin) || isEmpty(passwordMd5)) {
    return sendError(c, 'uin or passwordMd5 is empty');
  }
  if (isEmpty(ticket) || isEmpty(randstr)) {
    return sendError(c, 'captcha ticket or randstr is empty');
  }

  const { result, message, needNewDevice, jumpUrl, newDevicePullQrCodeSig: sig } = await WebUiDataRuntime.requestCaptchaLogin(uin!, passwordMd5!, ticket!, randstr!, sid || '');
  if (!result) {
    if (needNewDevice && jumpUrl) {
      return sendSuccess(c, { needNewDevice: true, jumpUrl, newDevicePullQrCodeSig: sig });
    }
    return sendError(c, message);
  }
  return sendSuccess(c, null);
};

// 新设备验证登录（密码登录需要新设备验证时的第二步）
export const QQNewDeviceLoginHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin, passwordMd5, newDevicePullQrCodeSig } = body as { uin?: string; passwordMd5?: string; newDevicePullQrCodeSig?: string };
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(c, 'QQ Is Logined');
  }
  if (isEmpty(uin) || isEmpty(passwordMd5)) {
    return sendError(c, 'uin or passwordMd5 is empty');
  }
  if (isEmpty(newDevicePullQrCodeSig)) {
    return sendError(c, 'newDevicePullQrCodeSig is empty');
  }

  const { result, message, needNewDevice, jumpUrl, newDevicePullQrCodeSig: sig } = await WebUiDataRuntime.requestNewDeviceLogin(uin!, passwordMd5!, newDevicePullQrCodeSig!);
  if (!result) {
    if (needNewDevice && jumpUrl) {
      return sendSuccess(c, { needNewDevice: true, jumpUrl, newDevicePullQrCodeSig: sig });
    }
    return sendError(c, message);
  }
  return sendSuccess(c, null);
};

// 重置设备信息
export const QQResetDeviceIDHandler = async (c: Context) => {
  try {
    const registryPath = getRegistryPath();
    // 自动备份
    try {
      await Registry20Utils.backup(registryPath);
    } catch (_e) {
      // 忽略备份错误（例如文件不存在）
    }

    await Registry20Utils.delete(registryPath);
    return sendSuccess(c, { message: 'Device ID reset successfully (Registry20 deleted)' });
  } catch (e) {
    return sendError(c, `Failed to reset Device ID: ${(e as Error).message}`);
  }
};

// 获取设备 GUID
export const QQGetDeviceGUIDHandler = async (c: Context) => {
  try {
    const registryPath = getRegistryPath();
    const guid = await Registry20Utils.readGuid(registryPath);
    return sendSuccess(c, { guid });
  } catch (e) {
    // 可能是文件不存在，或者非 Windows 平台，或者解密失败
    return sendError(c, `Failed to get GUID: ${(e as Error).message}`);
  }
};

// 设置设备 GUID
export const QQSetDeviceGUIDHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { guid } = body as { guid?: string };
  if (!guid || typeof guid !== 'string' || guid.length !== 32) {
    return sendError(c, 'Invalid GUID format, must be 32 hex characters');
  }
  try {
    const registryPath = getRegistryPath();
    // 自动备份
    try {
      await Registry20Utils.backup(registryPath);
    } catch { }

    await Registry20Utils.writeGuid(registryPath, guid);
    return sendSuccess(c, { message: 'GUID set successfully' });
  } catch (e) {
    return sendError(c, `Failed to set GUID: ${(e as Error).message}`);
  }
};

// 获取备份列表
export const QQGetGUIDBackupsHandler = async (c: Context) => {
  try {
    const registryPath = getRegistryPath();
    const backups = Registry20Utils.getBackups(registryPath);
    return sendSuccess(c, backups);
  } catch (e) {
    return sendError(c, `Failed to get backups: ${(e as Error).message}`);
  }
};

// 恢复备份
export const QQRestoreGUIDBackupHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { backupName } = body as { backupName?: string };
  if (!backupName) {
    return sendError(c, 'Backup name is required');
  }
  try {
    const registryPath = getRegistryPath();
    await Registry20Utils.restore(registryPath, backupName);
    return sendSuccess(c, { message: 'Restored successfully' });
  } catch (e) {
    return sendError(c, `Failed to restore: ${(e as Error).message}`);
  }
};

// 创建备份
export const QQCreateGUIDBackupHandler = async (c: Context) => {
  try {
    const registryPath = getRegistryPath();
    const backupPath = await Registry20Utils.backup(registryPath);
    return sendSuccess(c, { message: 'Backup created', path: backupPath });
  } catch (e) {
    return sendError(c, `Failed to backup: ${(e as Error).message}`);
  }
};

// 重启NapCat
export const QQRestartNapCatHandler = async (c: Context) => {
  try {
    const result = await WebUiDataRuntime.requestRestartProcess();
    if (result.result) {
      return sendSuccess(c, { message: result.message || 'Restart initiated' });
    } else {
      return sendError(c, result.message || 'Restart failed');
    }
  } catch (e) {
    return sendError(c, `Restart error: ${(e as Error).message}`);
  }
};

// ============================================================
// 平台信息 & Linux GUID 管理
// ============================================================

// 获取平台信息
export const QQGetPlatformInfoHandler = async (c: Context) => {
  return sendSuccess(c, { platform: os.platform() });
};

// 获取 Linux MAC 地址 (从 machine-info 文件读取)
export const QQGetLinuxMACHandler = async (c: Context) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    const mac = MachineInfoUtils.readMac(machineInfoPath);
    return sendSuccess(c, { mac });
  } catch (e) {
    return sendError(c, `Failed to get MAC: ${(e as Error).message}`);
  }
};

// 设置 Linux MAC 地址 (写入 machine-info 文件)
export const QQSetLinuxMACHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { mac } = body as { mac?: string };
  if (!mac || typeof mac !== 'string') {
    return sendError(c, 'MAC address is required');
  }
  try {
    const machineInfoPath = getMachineInfoPath();
    // 自动备份
    try {
      MachineInfoUtils.backup(machineInfoPath);
    } catch { }

    MachineInfoUtils.writeMac(machineInfoPath, mac);
    return sendSuccess(c, { message: 'MAC set successfully' });
  } catch (e) {
    return sendError(c, `Failed to set MAC: ${(e as Error).message}`);
  }
};

// 获取 Linux machine-id
export const QQGetLinuxMachineIdHandler = async (c: Context) => {
  try {
    const machineId = MachineInfoUtils.readMachineId();
    return sendSuccess(c, { machineId });
  } catch (e) {
    return sendError(c, `Failed to read machine-id: ${(e as Error).message}`);
  }
};

// 计算 Linux GUID (用于前端实时预览)
export const QQComputeLinuxGUIDHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { mac, machineId } = body as { mac?: string; machineId?: string };
  try {
    // 如果没传 machineId，从 /etc/machine-id 读取
    let mid = machineId;
    if (!mid || typeof mid !== 'string') {
      try {
        mid = MachineInfoUtils.readMachineId();
      } catch {
        mid = '';
      }
    }
    // 如果没传 mac，从 machine-info 文件读取
    let macStr = mac;
    if (!macStr || typeof macStr !== 'string') {
      try {
        const machineInfoPath = getMachineInfoPath();
        macStr = MachineInfoUtils.readMac(machineInfoPath);
      } catch {
        macStr = '';
      }
    }
    const guid = MachineInfoUtils.computeGuid(mid, macStr);
    return sendSuccess(c, { guid, machineId: mid, mac: macStr });
  } catch (e) {
    return sendError(c, `Failed to compute GUID: ${(e as Error).message}`);
  }
};

// 获取 Linux machine-info 备份列表
export const QQGetLinuxMachineInfoBackupsHandler = async (c: Context) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    const backups = MachineInfoUtils.getBackups(machineInfoPath);
    return sendSuccess(c, backups);
  } catch (e) {
    return sendError(c, `Failed to get backups: ${(e as Error).message}`);
  }
};

// 创建 Linux machine-info 备份
export const QQCreateLinuxMachineInfoBackupHandler = async (c: Context) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    const backupPath = MachineInfoUtils.backup(machineInfoPath);
    return sendSuccess(c, { message: 'Backup created', path: backupPath });
  } catch (e) {
    return sendError(c, `Failed to backup: ${(e as Error).message}`);
  }
};

// 恢复 Linux machine-info 备份
export const QQRestoreLinuxMachineInfoBackupHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { backupName } = body as { backupName?: string };
  if (!backupName) {
    return sendError(c, 'Backup name is required');
  }
  try {
    const machineInfoPath = getMachineInfoPath();
    MachineInfoUtils.restore(machineInfoPath, backupName);
    return sendSuccess(c, { message: 'Restored successfully' });
  } catch (e) {
    return sendError(c, `Failed to restore: ${(e as Error).message}`);
  }
};

// 重置 Linux 设备信息 (删除 machine-info)
export const QQResetLinuxDeviceIDHandler = async (c: Context) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    // 自动备份
    try {
      MachineInfoUtils.backup(machineInfoPath);
    } catch { }

    MachineInfoUtils.delete(machineInfoPath);
    return sendSuccess(c, { message: 'Device ID reset successfully (machine-info deleted)' });
  } catch (e) {
    return sendError(c, `Failed to reset Device ID: ${(e as Error).message}`);
  }
};

// ============================================================
// OIDB 新设备 QR 验证
// ============================================================

// 获取新设备验证二维码 (通过 OIDB 接口)
export const QQGetNewDeviceQRCodeHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin, jumpUrl } = body as { uin?: string; jumpUrl?: string };
  if (!uin || !jumpUrl) {
    return sendError(c, 'uin and jumpUrl are required');
  }

  // 从 jumpUrl 中提取参数
  // jumpUrl 格式: https://accounts.qq.com/safe/verify?...&uin-token=xxx&sig=yyy
  // sig -> str_dev_auth_token, uin-token -> str_uin_token
  const url = new URL(jumpUrl);
  const strDevAuthToken = url.searchParams.get('sig') || '';
  const strUinToken = url.searchParams.get('uin-token') || '';

  if (!strDevAuthToken || !strUinToken) {
    return sendError(c, 'Failed to get new device QR code: unable to extract sig/uin-token from jumpUrl');
  }

  const reqBody = {
    str_dev_auth_token: strDevAuthToken,
    uint32_flag: 1,
    uint32_url_type: 0,
    str_uin_token: strUinToken,
    str_dev_type: 'Windows',
    str_dev_name: os.hostname() || 'DESKTOP-NAPCAT',
  };

  const result = await oidbRequest(uin, reqBody);
  return sendSuccess(c, result);
};

// 轮询新设备验证二维码状态
export const QQPollNewDeviceQRHandler = async (c: Context) => {
  const body = await c.req.json().catch(() => ({}));
  const { uin, bytesToken } = body as { uin?: string; bytesToken?: string };
  if (!uin || !bytesToken) {
    return sendError(c, 'uin and bytesToken are required');
  }

  try {
    const reqBody = {
      uint32_flag: 0,
      bytes_token: bytesToken, // base64 编码的 token
    };

    const result = await oidbRequest(uin, reqBody);
    // result 应包含 uint32_guarantee_status:
    // 0 = 等待扫码, 3 = 已扫码, 1 = 已确认 (包含 str_nt_succ_token)
    return sendSuccess(c, result);
  } catch (e) {
    return sendError(c, `Failed to poll QR status: ${(e as Error).message}`);
  }
};
