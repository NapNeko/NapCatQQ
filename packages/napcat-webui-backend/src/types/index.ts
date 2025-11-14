import type { LoginListItem, SelfInfo } from 'napcat-core';
import type { OneBotConfig } from 'napcat-onebot/config/config';

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

export interface LoginRuntimeType {
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
    onQuickLoginRequested: (uin: string) => Promise<{ result: boolean; message: string }>;
    onOB11ConfigChanged: (ob11: OneBotConfig) => Promise<void>;
    QQLoginList: string[];
    NewQQLoginList: LoginListItem[];
  };
  NapCatVersion: string;
}

export default {};
