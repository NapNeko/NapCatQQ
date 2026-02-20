import { NodeIKernelLoginListener } from '@/napcat-core/listeners/NodeIKernelLoginListener';
import { GeneralCallResult } from './common';

export interface LoginInitConfig {
  machineId: '';
  appid: string;
  platVer: string;
  commonPath: string;
  clientVer: string;
  hostName: string;
  externalVersion: boolean;
}

export interface PasswordLoginRetType {
  result: string,
  loginErrorInfo: {
    step: number;
    errMsg: string;
    proofWaterUrl: string;
    newDevicePullQrCodeSig: string;
    jumpUrl: string,
    jumpWord: string;
    tipsTitle: string;
    tipsContent: string;
  };
}

export interface PasswordLoginArgType {
  uin: string;
  passwordMd5: string;// passwMD5
  step: number;// 猜测是需要二次认证 参数 一次为0
  newDeviceLoginSig: string;
  proofWaterSig: string;
  proofWaterRand: string;
  proofWaterSid: string;
}

export interface LoginListItem {
  uin: string;
  uid: string;
  nickName: string;
  faceUrl: string;
  facePath: string;
  loginType: 1; // 1是二维码登录？
  isQuickLogin: boolean; // 是否可以快速登录
  isAutoLogin: boolean; // 是否可以自动登录
}

export interface QuickLoginResult {
  result: string;
  loginErrorInfo: {
    step: number,
    errMsg: string,
    proofWaterUrl: string,
    newDevicePullQrCodeSig: string,
    jumpUrl: string,
    jumpWord: string,
    tipsTitle: string,
    tipsContent: string;
  };
}

export interface NodeIKernelLoginService {
  getMsfStatus: () => number;

  setLoginMiscData (key: string, value: string): unknown;

  getLoginMiscData (key: string): Promise<GeneralCallResult & { value: string; }>;

  getMachineGuid (): string;

  get (): NodeIKernelLoginService;

  connect (): boolean;

  addKernelLoginListener (listener: NodeIKernelLoginListener): number;

  removeKernelLoginListener (listenerId: number): void;

  initConfig (config: LoginInitConfig): void;

  getLoginList (): Promise<{
    result: number,
    LocalLoginInfoList: LoginListItem[];
  }>;

  quickLoginWithUin (uin: string): Promise<QuickLoginResult>;

  passwordLogin (param: PasswordLoginArgType): Promise<QuickLoginResult>;

  getQRCodePicture (): boolean;

  destroy (): unknown;

  cancel (): unknown;

  abortPolling (): unknown;

  startPolling (): unknown;

  deleteLoginInfo (arg: unknown): unknown;

  isHasLoginInfo (uin: string): boolean;

  loadNoLoginUnitedConfig (arg: unknown): unknown;

  loginUnusualDevice (arg: unknown): unknown;

  registerUnitedConfigPushGroupList (groupList: unknown): unknown;

  resetLoginInfo (arg: unknown): unknown;

  setAutoLogin (arg: unknown): unknown;

  setRemerberPwd (remember: boolean): unknown;

  online (): unknown;

  offline (): unknown;
}
