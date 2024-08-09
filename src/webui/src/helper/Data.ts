import { OB11Config } from '@/onebot11/config';

interface LoginRuntimeType {
    LoginCurrentTime: number;
    LoginCurrentRate: number;
    QQLoginStatus: boolean;
    QQQRCodeURL: string;
    QQLoginUin: string;
    NapCatHelper: {
        CoreQuickLoginCall: (uin: string) => Promise<{ result: boolean, message: string }>;
        SetOb11ConfigCall: (ob11: OB11Config) => Promise<void>;
        QQLoginList: string[]
    }
}
const LoginRuntime: LoginRuntimeType = {
    LoginCurrentTime: Date.now(),
    LoginCurrentRate: 0,
    QQLoginStatus: false, //已实现 但太傻了 得去那边注册个回调刷新
    QQQRCodeURL: '',
    QQLoginUin: '',
    NapCatHelper: {
        SetOb11ConfigCall: async (ob11: OB11Config) => { return; },
        CoreQuickLoginCall: async (uin: string) => { return { result: false, message: '' }; },
        QQLoginList: []
    }
};
export const WebUiDataRuntime = {
    checkLoginRate: async function (RateLimit: number): Promise<boolean> {
        LoginRuntime.LoginCurrentRate++;
        //console.log(RateLimit, LoginRuntime.LoginCurrentRate, Date.now() - LoginRuntime.LoginCurrentTime);
        if (Date.now() - LoginRuntime.LoginCurrentTime > 1000 * 60) {
            LoginRuntime.LoginCurrentRate = 0;//超出时间重置限速
            LoginRuntime.LoginCurrentTime = Date.now();
            return true;
        }
        if (LoginRuntime.LoginCurrentRate <= RateLimit) {
            return true;
        }
        return false;
    }
    ,
    getQQLoginStatus: async function (): Promise<boolean> {
        return LoginRuntime.QQLoginStatus;
    }
    ,
    setQQLoginStatus: async function (status: boolean): Promise<void> {
        LoginRuntime.QQLoginStatus = status;
    }
    ,
    setQQLoginQrcodeURL: async function (url: string): Promise<void> {
        LoginRuntime.QQQRCodeURL = url;
    }
    ,
    getQQLoginQrcodeURL: async function (): Promise<string> {
        return LoginRuntime.QQQRCodeURL;
    }
    ,
    setQQLoginUin: async function (uin: string): Promise<void> {
        LoginRuntime.QQLoginUin = uin;
    }
    ,
    getQQLoginUin: async function (): Promise<string> {
        return LoginRuntime.QQLoginUin;
    },
    getQQQuickLoginList: async function (): Promise<any[]> {
        return LoginRuntime.NapCatHelper.QQLoginList;
    },
    setQQQuickLoginList: async function (list: string[]): Promise<void> {
        LoginRuntime.NapCatHelper.QQLoginList = list;
    },
    setQQQuickLoginCall(func: (uin: string) => Promise<{ result: boolean, message: string }>): void {
        LoginRuntime.NapCatHelper.CoreQuickLoginCall = func;
    },
    getQQQuickLogin: async function (uin: string): Promise<{ result: boolean, message: string }> {
        return await LoginRuntime.NapCatHelper.CoreQuickLoginCall(uin);
    },
    setOB11ConfigCall: async function (func: (ob11: OB11Config) => Promise<void>): Promise<void> {
        LoginRuntime.NapCatHelper.SetOb11ConfigCall = func;
    },
    setOB11Config: async function (ob11: OB11Config): Promise<void> {
        await LoginRuntime.NapCatHelper.SetOb11ConfigCall(ob11);
    }
};