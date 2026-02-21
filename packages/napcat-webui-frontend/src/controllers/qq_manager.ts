import { AxiosRequestConfig } from 'axios';
import { serverRequest } from '@/utils/request';

import { SelfInfo } from '@/types/user';

export default class QQManager {
  public static async getOB11Config () {
    const data = await serverRequest.post<ServerResponse<OneBotConfig>>(
      '/OB11Config/GetConfig'
    );

    return data.data.data;
  }

  public static async setOB11Config (config: OneBotConfig) {
    await serverRequest.post<ServerResponse<null>>('/OB11Config/SetConfig', {
      config: JSON.stringify(config),
    });
  }

  public static async checkQQLoginStatus () {
    const data = await serverRequest.post<
      ServerResponse<{
        isLogin: boolean;
        isOffline?: boolean;
        qrcodeurl: string;
      }>
    >('/QQLogin/CheckLoginStatus');

    return data.data.data;
  }

  public static async checkQQLoginStatusWithQrcode () {
    const data = await serverRequest.post<
      ServerResponse<{ qrcodeurl: string; isLogin: boolean; isOffline?: boolean; loginError?: string; }>
    >('/QQLogin/CheckLoginStatus');

    return data.data.data;
  }

  public static async refreshQRCode () {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/RefreshQRcode');
  }

  public static async getQQLoginQrcode () {
    const data = await serverRequest.post<
      ServerResponse<{
        qrcode: string;
      }>
    >('/QQLogin/GetQQLoginQrcode');

    return data.data.data.qrcode;
  }

  public static async getQQQuickLoginList () {
    const data = await serverRequest.post<ServerResponse<string[]>>(
      '/QQLogin/GetQuickLoginList'
    );

    return data.data.data;
  }

  public static async getQQQuickLoginListNew () {
    const data = await serverRequest.post<ServerResponse<LoginListItem[]>>(
      '/QQLogin/GetQuickLoginListNew'
    );
    return data.data.data;
  }

  public static async setQuickLogin (uin: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/SetQuickLogin', {
      uin,
    });
  }

  public static async getQQLoginInfo (config?: AxiosRequestConfig) {
    const data = await serverRequest.post<ServerResponse<SelfInfo>>(
      '/QQLogin/GetQQLoginInfo',
      {},
      config
    );
    return data.data.data;
  }

  public static async getQuickLoginQQ () {
    const { data } = await serverRequest.post<ServerResponse<string>>(
      '/QQLogin/GetQuickLoginQQ'
    );
    return data.data;
  }

  public static async setQuickLoginQQ (uin: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/SetQuickLoginQQ', {
      uin,
    });
  }

  public static async passwordLogin (uin: string, passwordMd5: string) {
    const data = await serverRequest.post<ServerResponse<{
      needCaptcha?: boolean;
      proofWaterUrl?: string;
      needNewDevice?: boolean;
      jumpUrl?: string;
      newDevicePullQrCodeSig?: string;
    } | null>>('/QQLogin/PasswordLogin', {
      uin,
      passwordMd5,
    });
    return data.data.data;
  }

  public static async captchaLogin (uin: string, passwordMd5: string, ticket: string, randstr: string, sid: string) {
    const data = await serverRequest.post<ServerResponse<{
      needNewDevice?: boolean;
      jumpUrl?: string;
      newDevicePullQrCodeSig?: string;
    } | null>>('/QQLogin/CaptchaLogin', {
      uin,
      passwordMd5,
      ticket,
      randstr,
      sid,
    });
    return data.data.data;
  }

  public static async newDeviceLogin (uin: string, passwordMd5: string, newDevicePullQrCodeSig: string) {
    const data = await serverRequest.post<ServerResponse<{
      needNewDevice?: boolean;
      jumpUrl?: string;
      newDevicePullQrCodeSig?: string;
    } | null>>('/QQLogin/NewDeviceLogin', {
      uin,
      passwordMd5,
      newDevicePullQrCodeSig,
    });
    return data.data.data;
  }

  public static async getNewDeviceQRCode (uin: string, jumpUrl: string) {
    const data = await serverRequest.post<ServerResponse<{
      str_url?: string;
      bytes_token?: string;
    }>>('/QQLogin/GetNewDeviceQRCode', {
      uin,
      jumpUrl,
    });
    return data.data.data;
  }

  public static async pollNewDeviceQR (uin: string, bytesToken: string) {
    const data = await serverRequest.post<ServerResponse<{
      uint32_guarantee_status?: number;
      str_nt_succ_token?: string;
    }>>('/QQLogin/PollNewDeviceQR', {
      uin,
      bytesToken,
    });
    return data.data.data;
  }

  public static async resetDeviceID () {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/ResetDeviceID');
  }

  public static async restartNapCat () {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/RestartNapCat');
  }

  public static async getDeviceGUID () {
    const data = await serverRequest.post<ServerResponse<{ guid: string; }>>('/QQLogin/GetDeviceGUID');
    return data.data.data;
  }

  public static async setDeviceGUID (guid: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/SetDeviceGUID', { guid });
  }

  public static async getGUIDBackups () {
    const data = await serverRequest.post<ServerResponse<string[]>>('/QQLogin/GetGUIDBackups');
    return data.data.data;
  }

  public static async restoreGUIDBackup (backupName: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/RestoreGUIDBackup', { backupName });
  }

  public static async createGUIDBackup () {
    const data = await serverRequest.post<ServerResponse<{ path: string; }>>('/QQLogin/CreateGUIDBackup');
    return data.data.data;
  }

  // ============================================================
  // 平台信息 & Linux GUID 管理
  // ============================================================

  public static async getPlatformInfo () {
    const data = await serverRequest.post<ServerResponse<{ platform: string; }>>('/QQLogin/GetPlatformInfo');
    return data.data.data;
  }

  public static async getLinuxMAC () {
    const data = await serverRequest.post<ServerResponse<{ mac: string; }>>('/QQLogin/GetLinuxMAC');
    return data.data.data;
  }

  public static async setLinuxMAC (mac: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/SetLinuxMAC', { mac });
  }

  public static async getLinuxMachineId () {
    const data = await serverRequest.post<ServerResponse<{ machineId: string; }>>('/QQLogin/GetLinuxMachineId');
    return data.data.data;
  }

  public static async computeLinuxGUID (mac?: string, machineId?: string) {
    const data = await serverRequest.post<ServerResponse<{ guid: string; machineId: string; mac: string; }>>('/QQLogin/ComputeLinuxGUID', { mac, machineId });
    return data.data.data;
  }

  public static async getLinuxMachineInfoBackups () {
    const data = await serverRequest.post<ServerResponse<string[]>>('/QQLogin/GetLinuxMachineInfoBackups');
    return data.data.data;
  }

  public static async createLinuxMachineInfoBackup () {
    const data = await serverRequest.post<ServerResponse<{ path: string; }>>('/QQLogin/CreateLinuxMachineInfoBackup');
    return data.data.data;
  }

  public static async restoreLinuxMachineInfoBackup (backupName: string) {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/RestoreLinuxMachineInfoBackup', { backupName });
  }

  public static async resetLinuxDeviceID () {
    await serverRequest.post<ServerResponse<null>>('/QQLogin/ResetLinuxDeviceID');
  }

  // ============================================================
  // NapCat 配置管理
  // ============================================================

  public static async getNapCatConfig () {
    const { data } = await serverRequest.get<ServerResponse<NapCatConfig>>(
      '/NapCatConfig/GetConfig'
    );
    return data.data;
  }

  public static async setNapCatConfig (config: Partial<NapCatConfig>) {
    await serverRequest.post<ServerResponse<null>>(
      '/NapCatConfig/SetConfig',
      config
    );
  }
}

