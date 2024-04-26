import { NodeIKernelLoginListener } from '@/core/listeners/NodeIKernelLoginListener';
export interface LoginInitConfig {
    machineId: '';
    appid: string;
    platVer: string;
    commonPath: string;
    clientVer: string;
    hostName: string;
}
export interface passwordLoginRetType {
    result: string;
    loginErrorInfo: {
        step: number;
        errMsg: string;
        proofWaterUrl: string;
        newDevicePullQrCodeSig: string;
        jumpUrl: string;
        jumpWord: string;
        tipsTitle: string;
        tipsContent: string;
    };
}
export interface passwordLoginArgType {
    uin: string;
    passwordMd5: string;
    step: number;
    newDeviceLoginSig: string;
    proofWaterSig: string;
    proofWaterRand: string;
    proofWaterSid: string;
}
export interface QRCodeLoginSucceedType {
    account: string;
    mainAccount: string;
    uin: string;
    uid: string;
    nickName: string;
    gender: number;
    age: number;
    faceUrl: string;
}
export interface LoginListItem {
    uin: string;
    uid: string;
    nickName: string;
    faceUrl: string;
    facePath: string;
    loginType: 1;
    isQuickLogin: boolean;
    isAutoLogin: boolean;
}
export interface NodeIKernelLoginService {
    new (): NodeIKernelLoginService;
    addKernelLoginListener(listener: NodeIKernelLoginListener): void;
    initConfig(config: LoginInitConfig): void;
    getLoginMiscData(cb: (r: unknown) => void): void;
    getLoginList(): Promise<{
        result: number;
        LocalLoginInfoList: LoginListItem[];
    }>;
    quickLoginWithUin(uin: string): Promise<{
        result: string;
        loginErrorInfo: {
            step: number;
            errMsg: string;
            proofWaterUrl: string;
            newDevicePullQrCodeSig: string;
            jumpUrl: string;
            jumpWord: string;
            tipsTitle: string;
            tipsContent: string;
        };
    }>;
    passwordLogin(param: passwordLoginArgType): Promise<any>;
    getQRCodePicture(): boolean;
}
