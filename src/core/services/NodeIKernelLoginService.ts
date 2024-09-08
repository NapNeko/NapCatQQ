import { NodeIKernelLoginListener } from '@/core/listeners/NodeIKernelLoginListener';

export interface LoginInitConfig {
    machineId: '';
    appid: string;
    platVer: string;
    commonPath: string;
    clientVer: string;
    hostName: string;
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
    }
}

export interface PasswordLoginArgType {
    uin: string;
    passwordMd5: string;//passwMD5
    step: number;//猜测是需要二次认证 参数 一次为0
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
        tipsContent: string
    };
}

export interface NodeIKernelLoginService {
    connect(): boolean;
    // eslint-disable-next-line @typescript-eslint/no-misused-new
    new(): NodeIKernelLoginService;

    addKernelLoginListener(listener: NodeIKernelLoginListener): number;

    removeKernelLoginListener(listener: number): void;

    initConfig(config: LoginInitConfig): void;

    getLoginMiscData(cb: (r: unknown) => void): void;

    getLoginList(): Promise<{
        result: number,  // 0是ok
        LocalLoginInfoList: LoginListItem[]
    }>;

    quickLoginWithUin(uin: string): Promise<QuickLoginResult>;

    passwordLogin(param: PasswordLoginArgType): Promise<any>;

    getQRCodePicture(): boolean;
}
