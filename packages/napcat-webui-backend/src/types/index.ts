import type { OneBotConfig } from '@/napcat-webui-backend/src/onebot/config';

export interface SatoriConfig {
  network: {
    websocketServers: SatoriWebSocketServerConfig[];
    httpServers: SatoriHttpServerConfig[];
    webhookClients: SatoriWebHookClientConfig[];
  };
  platform: string;
  selfId: string;
}

export interface SatoriWebSocketServerConfig {
  name: string;
  enable: boolean;
  host: string;
  port: number;
  token: string;
  path: string;
  debug: boolean;
  heartInterval: number;
}

export interface SatoriHttpServerConfig {
  name: string;
  enable: boolean;
  host: string;
  port: number;
  token: string;
  path: string;
  debug: boolean;
}

export interface SatoriWebHookClientConfig {
  name: string;
  enable: boolean;
  url: string;
  token: string;
  debug: boolean;
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
  OneBotContext: any | null; // OneBot 上下文，用于调试功能
  SatoriContext: any | null; // Satori 上下文
  NapCatHelper: {
    onQuickLoginRequested: (uin: string) => Promise<{ result: boolean; message: string; }>;
    onOB11ConfigChanged: (ob11: OneBotConfig) => Promise<void>;
    onSatoriConfigChanged: (config: SatoriConfig) => Promise<void>;
    QQLoginList: string[];
    NewQQLoginList: LoginListItem[];
  };
  NapCatVersion: string;
}

export default {};
