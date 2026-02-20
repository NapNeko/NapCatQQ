import { Router } from 'express';

import {
  QQCheckLoginStatusHandler,
  QQGetQRcodeHandler,
  QQGetQuickLoginListHandler,
  QQSetQuickLoginHandler,
  QQGetLoginListNewHandler,
  getQQLoginInfoHandler,
  getAutoLoginAccountHandler,
  setAutoLoginAccountHandler,
  QQRefreshQRcodeHandler,
  QQPasswordLoginHandler,
  QQResetDeviceIDHandler,
  QQRestartNapCatHandler,
  QQGetDeviceGUIDHandler,
  QQSetDeviceGUIDHandler,
  QQGetGUIDBackupsHandler,
  QQRestoreGUIDBackupHandler,
  QQCreateGUIDBackupHandler,
  QQGetPlatformInfoHandler,
  QQGetLinuxMACHandler,
  QQSetLinuxMACHandler,
  QQGetLinuxMachineIdHandler,
  QQComputeLinuxGUIDHandler,
  QQGetLinuxMachineInfoBackupsHandler,
  QQCreateLinuxMachineInfoBackupHandler,
  QQRestoreLinuxMachineInfoBackupHandler,
  QQResetLinuxDeviceIDHandler,
} from '@/napcat-webui-backend/src/api/QQLogin';

const router: Router = Router();
// router:获取快速登录列表
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler);
// router:获取快速登录列表（新）
router.all('/GetQuickLoginListNew', QQGetLoginListNewHandler);
// router:检查QQ登录状态
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
// router:获取QQ登录二维码
router.post('/GetQQLoginQrcode', QQGetQRcodeHandler);
// router:设置QQ快速登录
router.post('/SetQuickLogin', QQSetQuickLoginHandler);
// router:获取QQ登录信息
router.post('/GetQQLoginInfo', getQQLoginInfoHandler);
// router:获取快速登录QQ账号
router.post('/GetQuickLoginQQ', getAutoLoginAccountHandler);
// router:设置自动登录QQ账号
router.post('/SetQuickLoginQQ', setAutoLoginAccountHandler);
// router:刷新QQ登录二维码
router.post('/RefreshQRcode', QQRefreshQRcodeHandler);
// router:密码登录
router.post('/PasswordLogin', QQPasswordLoginHandler);
// router:重置设备信息
router.post('/ResetDeviceID', QQResetDeviceIDHandler);
// router:重启NapCat
router.post('/RestartNapCat', QQRestartNapCatHandler);
// router:获取设备GUID
router.post('/GetDeviceGUID', QQGetDeviceGUIDHandler);
// router:设置设备GUID
router.post('/SetDeviceGUID', QQSetDeviceGUIDHandler);
// router:获取GUID备份列表
router.post('/GetGUIDBackups', QQGetGUIDBackupsHandler);
// router:恢复GUID备份
router.post('/RestoreGUIDBackup', QQRestoreGUIDBackupHandler);
// router:创建GUID备份
router.post('/CreateGUIDBackup', QQCreateGUIDBackupHandler);

// ============================================================
// 平台信息 & Linux GUID 管理
// ============================================================
// router:获取平台信息
router.post('/GetPlatformInfo', QQGetPlatformInfoHandler);
// router:获取Linux MAC地址
router.post('/GetLinuxMAC', QQGetLinuxMACHandler);
// router:设置Linux MAC地址
router.post('/SetLinuxMAC', QQSetLinuxMACHandler);
// router:获取Linux machine-id
router.post('/GetLinuxMachineId', QQGetLinuxMachineIdHandler);
// router:计算Linux GUID
router.post('/ComputeLinuxGUID', QQComputeLinuxGUIDHandler);
// router:获取Linux machine-info备份列表
router.post('/GetLinuxMachineInfoBackups', QQGetLinuxMachineInfoBackupsHandler);
// router:创建Linux machine-info备份
router.post('/CreateLinuxMachineInfoBackup', QQCreateLinuxMachineInfoBackupHandler);
// router:恢复Linux machine-info备份
router.post('/RestoreLinuxMachineInfoBackup', QQRestoreLinuxMachineInfoBackupHandler);
// router:重置Linux设备信息
router.post('/ResetLinuxDeviceID', QQResetLinuxDeviceIDHandler);

export { router as QQLoginRouter };
