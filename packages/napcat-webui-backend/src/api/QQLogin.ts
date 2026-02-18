import { RequestHandler } from 'express';

import { WebUiDataRuntime } from '@/napcat-webui-backend/src/helper/Data';
import { WebUiConfig } from '@/napcat-webui-backend/index';
import { isEmpty } from '@/napcat-webui-backend/src/utils/check';
import { sendError, sendSuccess } from '@/napcat-webui-backend/src/utils/response';
import { Registry20Utils, MachineInfoUtils } from '@/napcat-webui-backend/src/utils/guid';
import os from 'node:os';

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
export const QQGetQRcodeHandler: RequestHandler = async (_, res) => {
  // 判断是否已经登录
  if (WebUiDataRuntime.getQQLoginStatus()) {
    // 已经登录
    return sendError(res, 'QQ Is Logined');
  }
  // 获取二维码
  const qrcodeUrl = WebUiDataRuntime.getQQLoginQrcodeURL();
  // 判断二维码是否为空
  if (isEmpty(qrcodeUrl)) {
    return sendError(res, 'QRCode Get Error');
  }
  // 返回二维码URL
  const data = {
    qrcode: qrcodeUrl,
  };
  return sendSuccess(res, data);
};

// 获取QQ登录状态
export const QQCheckLoginStatusHandler: RequestHandler = async (_, res) => {
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
  return sendSuccess(res, data);
};

// 快速登录
export const QQSetQuickLoginHandler: RequestHandler = async (req, res) => {
  // 获取QQ号
  const { uin } = req.body;
  // 判断是否已经登录
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(res, 'QQ Is Logined');
  }
  // 判断QQ号是否为空
  if (isEmpty(uin)) {
    return sendError(res, 'uin is empty');
  }

  // 获取快速登录状态
  const { result, message } = await WebUiDataRuntime.requestQuickLogin(uin);
  if (!result) {
    return sendError(res, message);
  }
  // 本来应该验证 但是http不宜这么搞 建议前端验证
  // isLogin = WebUiDataRuntime.getQQLoginStatus();
  return sendSuccess(res, null);
};

// 获取快速登录列表
export const QQGetQuickLoginListHandler: RequestHandler = async (_, res) => {
  const quickLoginList = WebUiDataRuntime.getQQQuickLoginList();
  return sendSuccess(res, quickLoginList);
};

// 获取快速登录列表（新）
export const QQGetLoginListNewHandler: RequestHandler = async (_, res) => {
  const newLoginList = WebUiDataRuntime.getQQNewLoginList();
  return sendSuccess(res, newLoginList);
};

// 获取登录的QQ的信息
export const getQQLoginInfoHandler: RequestHandler = async (_, res) => {
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
  return sendSuccess(res, data);
};

// 获取自动登录QQ账号
export const getAutoLoginAccountHandler: RequestHandler = async (_, res) => {
  const data = WebUiConfig.getAutoLoginAccount();
  return sendSuccess(res, data);
};

// 设置自动登录QQ账号
export const setAutoLoginAccountHandler: RequestHandler = async (req, res) => {
  const { uin } = req.body;
  await WebUiConfig.UpdateAutoLoginAccount(uin);
  return sendSuccess(res, null);
};

// 刷新QQ登录二维码
export const QQRefreshQRcodeHandler: RequestHandler = async (_, res) => {
  // 判断是否已经登录
  if (WebUiDataRuntime.getQQLoginStatus()) {
    // 已经登录
    return sendError(res, 'QQ Is Logined');
  }
  // 刷新二维码
  await WebUiDataRuntime.refreshQRCode();
  return sendSuccess(res, null);
};

// 密码登录
export const QQPasswordLoginHandler: RequestHandler = async (req, res) => {
  // 获取QQ号和密码MD5
  const { uin, passwordMd5 } = req.body;
  // 判断是否已经登录
  const isLogin = WebUiDataRuntime.getQQLoginStatus();
  if (isLogin) {
    return sendError(res, 'QQ Is Logined');
  }
  // 判断QQ号是否为空
  if (isEmpty(uin)) {
    return sendError(res, 'uin is empty');
  }
  // 判断密码MD5是否为空
  if (isEmpty(passwordMd5)) {
    return sendError(res, 'passwordMd5 is empty');
  }

  // 执行密码登录
  const { result, message } = await WebUiDataRuntime.requestPasswordLogin(uin, passwordMd5);
  if (!result) {
    return sendError(res, message);
  }
  return sendSuccess(res, null);
};

// 重置设备信息
export const QQResetDeviceIDHandler: RequestHandler = async (_, res) => {
  try {
    const registryPath = getRegistryPath();
    // 自动备份
    try {
      await Registry20Utils.backup(registryPath);
    } catch (e) {
      // 忽略备份错误（例如文件不存在）
    }

    await Registry20Utils.delete(registryPath);
    return sendSuccess(res, { message: 'Device ID reset successfully (Registry20 deleted)' });
  } catch (e) {
    return sendError(res, `Failed to reset Device ID: ${(e as Error).message}`);
  }
};

// 获取设备 GUID
export const QQGetDeviceGUIDHandler: RequestHandler = async (_, res) => {
  try {
    const registryPath = getRegistryPath();
    const guid = await Registry20Utils.readGuid(registryPath);
    return sendSuccess(res, { guid });
  } catch (e) {
    // 可能是文件不存在，或者非 Windows 平台，或者解密失败
    return sendError(res, `Failed to get GUID: ${(e as Error).message}`);
  }
};

// 设置设备 GUID
export const QQSetDeviceGUIDHandler: RequestHandler = async (req, res) => {
  const { guid } = req.body;
  if (!guid || typeof guid !== 'string' || guid.length !== 32) {
    return sendError(res, 'Invalid GUID format, must be 32 hex characters');
  }
  try {
    const registryPath = getRegistryPath();
    // 自动备份
    try {
      await Registry20Utils.backup(registryPath);
    } catch { }

    await Registry20Utils.writeGuid(registryPath, guid);
    return sendSuccess(res, { message: 'GUID set successfully' });
  } catch (e) {
    return sendError(res, `Failed to set GUID: ${(e as Error).message}`);
  }
};

// 获取备份列表
export const QQGetGUIDBackupsHandler: RequestHandler = async (_, res) => {
  try {
    const registryPath = getRegistryPath();
    const backups = Registry20Utils.getBackups(registryPath);
    return sendSuccess(res, backups);
  } catch (e) {
    return sendError(res, `Failed to get backups: ${(e as Error).message}`);
  }
};

// 恢复备份
export const QQRestoreGUIDBackupHandler: RequestHandler = async (req, res) => {
  const { backupName } = req.body;
  if (!backupName) {
    return sendError(res, 'Backup name is required');
  }
  try {
    const registryPath = getRegistryPath();
    await Registry20Utils.restore(registryPath, backupName);
    return sendSuccess(res, { message: 'Restored successfully' });
  } catch (e) {
    return sendError(res, `Failed to restore: ${(e as Error).message}`);
  }
};

// 创建备份
export const QQCreateGUIDBackupHandler: RequestHandler = async (_, res) => {
  try {
    const registryPath = getRegistryPath();
    const backupPath = await Registry20Utils.backup(registryPath);
    return sendSuccess(res, { message: 'Backup created', path: backupPath });
  } catch (e) {
    return sendError(res, `Failed to backup: ${(e as Error).message}`);
  }
};

// 重启NapCat
export const QQRestartNapCatHandler: RequestHandler = async (_, res) => {
  try {
    const result = await WebUiDataRuntime.requestRestartProcess();
    if (result.result) {
      return sendSuccess(res, { message: result.message || 'Restart initiated' });
    } else {
      return sendError(res, result.message || 'Restart failed');
    }
  } catch (e) {
    return sendError(res, `Restart error: ${(e as Error).message}`);
  }
};

// ============================================================
// 平台信息 & Linux GUID 管理
// ============================================================

// 获取平台信息
export const QQGetPlatformInfoHandler: RequestHandler = async (_, res) => {
  return sendSuccess(res, { platform: os.platform() });
};

// 获取 Linux MAC 地址 (从 machine-info 文件读取)
export const QQGetLinuxMACHandler: RequestHandler = async (_, res) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    const mac = MachineInfoUtils.readMac(machineInfoPath);
    return sendSuccess(res, { mac });
  } catch (e) {
    return sendError(res, `Failed to get MAC: ${(e as Error).message}`);
  }
};

// 设置 Linux MAC 地址 (写入 machine-info 文件)
export const QQSetLinuxMACHandler: RequestHandler = async (req, res) => {
  const { mac } = req.body;
  if (!mac || typeof mac !== 'string') {
    return sendError(res, 'MAC address is required');
  }
  try {
    const machineInfoPath = getMachineInfoPath();
    // 自动备份
    try {
      MachineInfoUtils.backup(machineInfoPath);
    } catch { }

    MachineInfoUtils.writeMac(machineInfoPath, mac);
    return sendSuccess(res, { message: 'MAC set successfully' });
  } catch (e) {
    return sendError(res, `Failed to set MAC: ${(e as Error).message}`);
  }
};

// 获取 Linux machine-id
export const QQGetLinuxMachineIdHandler: RequestHandler = async (_, res) => {
  try {
    const machineId = MachineInfoUtils.readMachineId();
    return sendSuccess(res, { machineId });
  } catch (e) {
    return sendError(res, `Failed to read machine-id: ${(e as Error).message}`);
  }
};

// 计算 Linux GUID (用于前端实时预览)
export const QQComputeLinuxGUIDHandler: RequestHandler = async (req, res) => {
  const { mac, machineId } = req.body;
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
    return sendSuccess(res, { guid, machineId: mid, mac: macStr });
  } catch (e) {
    return sendError(res, `Failed to compute GUID: ${(e as Error).message}`);
  }
};

// 获取 Linux machine-info 备份列表
export const QQGetLinuxMachineInfoBackupsHandler: RequestHandler = async (_, res) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    const backups = MachineInfoUtils.getBackups(machineInfoPath);
    return sendSuccess(res, backups);
  } catch (e) {
    return sendError(res, `Failed to get backups: ${(e as Error).message}`);
  }
};

// 创建 Linux machine-info 备份
export const QQCreateLinuxMachineInfoBackupHandler: RequestHandler = async (_, res) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    const backupPath = MachineInfoUtils.backup(machineInfoPath);
    return sendSuccess(res, { message: 'Backup created', path: backupPath });
  } catch (e) {
    return sendError(res, `Failed to backup: ${(e as Error).message}`);
  }
};

// 恢复 Linux machine-info 备份
export const QQRestoreLinuxMachineInfoBackupHandler: RequestHandler = async (req, res) => {
  const { backupName } = req.body;
  if (!backupName) {
    return sendError(res, 'Backup name is required');
  }
  try {
    const machineInfoPath = getMachineInfoPath();
    MachineInfoUtils.restore(machineInfoPath, backupName);
    return sendSuccess(res, { message: 'Restored successfully' });
  } catch (e) {
    return sendError(res, `Failed to restore: ${(e as Error).message}`);
  }
};

// 重置 Linux 设备信息 (删除 machine-info)
export const QQResetLinuxDeviceIDHandler: RequestHandler = async (_, res) => {
  try {
    const machineInfoPath = getMachineInfoPath();
    // 自动备份
    try {
      MachineInfoUtils.backup(machineInfoPath);
    } catch { }

    MachineInfoUtils.delete(machineInfoPath);
    return sendSuccess(res, { message: 'Device ID reset successfully (machine-info deleted)' });
  } catch (e) {
    return sendError(res, `Failed to reset Device ID: ${(e as Error).message}`);
  }
};


