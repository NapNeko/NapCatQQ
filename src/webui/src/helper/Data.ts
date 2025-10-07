import type { LoginRuntimeType } from '../types/data';
import packageJson from '../../../../package.json';
import store from '@/common/store';

const LoginRuntime: LoginRuntimeType = {
    LoginCurrentTime: Date.now(),
    LoginCurrentRate: 0,
    QQLoginStatus: false, //已实现 但太傻了 得去那边注册个回调刷新
    QQQRCodeURL: '',
    QQLoginUin: '',
    QQLoginInfo: {
        uid: '',
        uin: '',
        nick: '',
    },
    QQVersion: 'unknown',
    onQQLoginStatusChange: async (status: boolean) => {
        LoginRuntime.QQLoginStatus = status;
    },
    onWebUiTokenChange: async (_token: string) => {
        return;
    },
    NapCatHelper: {
        onOB11ConfigChanged: async () => {
            return;
        },
        onQuickLoginRequested: async () => {
            return { result: false, message: '' };
        },
        onCleanCacheRequested: async () => {
            return { result: false, message: '' };
        },
        QQLoginList: [],
        NewQQLoginList: [],
    },
    packageJson: packageJson,
    WebUiConfigQuickFunction: async () => {
        return;
    }
};

export const WebUiDataRuntime = {
    setWebUiTokenChangeCallback(func: (token: string) => Promise<void>): void {
        LoginRuntime.onWebUiTokenChange = func;
    },
    getWebUiTokenChangeCallback(): (token: string) => Promise<void> {
        return LoginRuntime.onWebUiTokenChange;
    },
    checkLoginRate(ip: string, RateLimit: number): boolean {
        const key = `login_rate:${ip}`;
        const count = store.get<number>(key) || 0;

        if (count === 0) {
            // 第一次访问，设置计数器为1，并设置60秒过期
            store.set(key, 1, 60);
            return true;
        }

        if (count >= RateLimit) {
            return false;
        }

        store.incr(key);
        return true;
    },

    getQQLoginStatus(): LoginRuntimeType['QQLoginStatus'] {
        return LoginRuntime.QQLoginStatus;
    },

    setQQLoginCallback(func: (status: boolean) => Promise<void>): void {
        LoginRuntime.onQQLoginStatusChange = func;
    },

    getQQLoginCallback(): (status: boolean) => Promise<void> {
        return LoginRuntime.onQQLoginStatusChange;
    },

    setQQLoginStatus(status: LoginRuntimeType['QQLoginStatus']): void {
        LoginRuntime.QQLoginStatus = status;
    },

    setQQLoginQrcodeURL(url: LoginRuntimeType['QQQRCodeURL']): void {
        LoginRuntime.QQQRCodeURL = url;
    },

    getQQLoginQrcodeURL(): LoginRuntimeType['QQQRCodeURL'] {
        return LoginRuntime.QQQRCodeURL;
    },

    setQQLoginInfo(info: LoginRuntimeType['QQLoginInfo']): void {
        LoginRuntime.QQLoginInfo = info;
        LoginRuntime.QQLoginUin = info.uin.toString();
    },

    getQQLoginInfo(): LoginRuntimeType['QQLoginInfo'] {
        return LoginRuntime.QQLoginInfo;
    },

    getQQLoginUin(): LoginRuntimeType['QQLoginUin'] {
        return LoginRuntime.QQLoginUin;
    },

    getQQQuickLoginList(): LoginRuntimeType['NapCatHelper']['QQLoginList'] {
        return LoginRuntime.NapCatHelper.QQLoginList;
    },

    setQQQuickLoginList(list: LoginRuntimeType['NapCatHelper']['QQLoginList']): void {
        LoginRuntime.NapCatHelper.QQLoginList = list;
    },

    getQQNewLoginList(): LoginRuntimeType['NapCatHelper']['NewQQLoginList'] {
        return LoginRuntime.NapCatHelper.NewQQLoginList;
    },

    setQQNewLoginList(list: LoginRuntimeType['NapCatHelper']['NewQQLoginList']): void {
        LoginRuntime.NapCatHelper.NewQQLoginList = list;
    },

    setQuickLoginCall(func: LoginRuntimeType['NapCatHelper']['onQuickLoginRequested']): void {
        LoginRuntime.NapCatHelper.onQuickLoginRequested = func;
    },

    requestQuickLogin: function (uin) {
        return LoginRuntime.NapCatHelper.onQuickLoginRequested(uin);
    } as LoginRuntimeType['NapCatHelper']['onQuickLoginRequested'],

    setOnOB11ConfigChanged(func: LoginRuntimeType['NapCatHelper']['onOB11ConfigChanged']): void {
        LoginRuntime.NapCatHelper.onOB11ConfigChanged = func;
    },

    setOB11Config: function (ob11) {
        return LoginRuntime.NapCatHelper.onOB11ConfigChanged(ob11);
    } as LoginRuntimeType['NapCatHelper']['onOB11ConfigChanged'],

    setCleanCacheCall(func: LoginRuntimeType['NapCatHelper']['onCleanCacheRequested']): void {
        LoginRuntime.NapCatHelper.onCleanCacheRequested = func;
    },

    requestCleanCache: function () {
        return LoginRuntime.NapCatHelper.onCleanCacheRequested();
    } as LoginRuntimeType['NapCatHelper']['onCleanCacheRequested'],

    getPackageJson() {
        return LoginRuntime.packageJson;
    },

    setQQVersion(version: string) {
        LoginRuntime.QQVersion = version;
    },

    getQQVersion() {
        return LoginRuntime.QQVersion;
    },

    setWebUiConfigQuickFunction(func: LoginRuntimeType['WebUiConfigQuickFunction']): void {
        LoginRuntime.WebUiConfigQuickFunction = func;
    },
    runWebUiConfigQuickFunction: async function () {
        await LoginRuntime.WebUiConfigQuickFunction();
    }
};
