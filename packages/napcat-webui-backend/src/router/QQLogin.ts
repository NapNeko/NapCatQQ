import { Hono } from 'hono';

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
  QQCaptchaLoginHandler,
  QQNewDeviceLoginHandler,
  QQGetNewDeviceQRCodeHandler,
  QQPollNewDeviceQRHandler,
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

const router = new Hono();
router.all('/GetQuickLoginList', QQGetQuickLoginListHandler);
router.all('/GetQuickLoginListNew', QQGetLoginListNewHandler);
router.post('/CheckLoginStatus', QQCheckLoginStatusHandler);
router.post('/GetQQLoginQrcode', QQGetQRcodeHandler);
router.post('/SetQuickLogin', QQSetQuickLoginHandler);
router.post('/GetQQLoginInfo', getQQLoginInfoHandler);
router.post('/GetQuickLoginQQ', getAutoLoginAccountHandler);
router.post('/SetQuickLoginQQ', setAutoLoginAccountHandler);
router.post('/RefreshQRcode', QQRefreshQRcodeHandler);
router.post('/PasswordLogin', QQPasswordLoginHandler);
router.post('/CaptchaLogin', QQCaptchaLoginHandler);
router.post('/NewDeviceLogin', QQNewDeviceLoginHandler);
router.post('/GetNewDeviceQRCode', QQGetNewDeviceQRCodeHandler);
router.post('/PollNewDeviceQR', QQPollNewDeviceQRHandler);
router.post('/ResetDeviceID', QQResetDeviceIDHandler);
router.post('/RestartNapCat', QQRestartNapCatHandler);
router.post('/GetDeviceGUID', QQGetDeviceGUIDHandler);
router.post('/SetDeviceGUID', QQSetDeviceGUIDHandler);
router.post('/GetGUIDBackups', QQGetGUIDBackupsHandler);
router.post('/RestoreGUIDBackup', QQRestoreGUIDBackupHandler);
router.post('/CreateGUIDBackup', QQCreateGUIDBackupHandler);
router.post('/GetPlatformInfo', QQGetPlatformInfoHandler);
router.post('/GetLinuxMAC', QQGetLinuxMACHandler);
router.post('/SetLinuxMAC', QQSetLinuxMACHandler);
router.post('/GetLinuxMachineId', QQGetLinuxMachineIdHandler);
router.post('/ComputeLinuxGUID', QQComputeLinuxGUIDHandler);
router.post('/GetLinuxMachineInfoBackups', QQGetLinuxMachineInfoBackupsHandler);
router.post('/CreateLinuxMachineInfoBackup', QQCreateLinuxMachineInfoBackupHandler);
router.post('/RestoreLinuxMachineInfoBackup', QQRestoreLinuxMachineInfoBackupHandler);
router.post('/ResetLinuxDeviceID', QQResetLinuxDeviceIDHandler);

export { router as QQLoginRouter };
