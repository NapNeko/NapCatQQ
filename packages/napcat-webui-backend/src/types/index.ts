import type { OneBotConfig } from '@/napcat-webui-backend/src/onebot/config';
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

interface SelfInfo {
  uid: string;
  uin: string;
  nick: string;
}
export interface WebUiConfigType {
  host: string;
  port: number;
  token: string;
  loginRate: number;
}
export interface WebUiCredentialInnerJson {
  CreatedTime: number;
  HashEncoded: string;
}

export interface WebUiCredentialJson {
  Data: WebUiCredentialInnerJson;
  Hmac: string;
}
export enum NapCatCoreWorkingEnv {
  Unknown = 0,
  Shell = 1,
  Framework = 2,
}
export interface LoginRuntimeType {
  workingEnv: NapCatCoreWorkingEnv;
  LoginCurrentTime: number;
  LoginCurrentRate: number;
  QQLoginStatus: boolean;
  QQQRCodeURL: string;
  QQLoginUin: string;
  QQLoginInfo: SelfInfo;
  QQVersion: string;
  onQQLoginStatusChange: (status: boolean) => Promise<void>;
  onWebUiTokenChange: (token: string) => Promise<void>;
  WebUiConfigQuickFunction: () => Promise<void>;
  NapCatHelper: {
    onQuickLoginRequested: (uin: string) => Promise<{ result: boolean; message: string; }>;
    onOB11ConfigChanged: (ob11: OneBotConfig) => Promise<void>;
    QQLoginList: string[];
    NewQQLoginList: LoginListItem[];
  };
  NapCatVersion: string;
}

export default {};
