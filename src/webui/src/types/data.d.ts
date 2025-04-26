import type { LoginListItem, SelfInfo } from '@/core';
import type { OneBotConfig } from '@/onebot/config/config';

interface LoginRuntimeType {
    LoginCurrentTime: number;
    LoginCurrentRate: number;
    QQLoginStatus: boolean;
    QQQRCodeURL: string;
    QQLoginUin: string;
    QQLoginInfo: SelfInfo;
    QQVersion: string;
    WebUiConfigQuickFunction: () => Promise<void>;
    NapCatHelper: {
        onQuickLoginRequested: (uin: string) => Promise<{ result: boolean; message: string }>;
        onOB11ConfigChanged: (ob11: OneBotConfig) => Promise<void>;
        QQLoginList: string[];
        NewQQLoginList: LoginListItem[];
    };
    packageJson: object;
}
