let LoginRuntime = {
    LoginCurrentTime: Date.now(),
    LoginCurrentRate: 0,
    QQLoginStatus: false, //得去那边注册个回调刷新
    QQQRCodeURL: "",
    QQLoginUin: 0
}
export const DataRuntime = {
    checkLoginRate: async function (RateLimit: number): Promise<boolean> {
        if (Date.now() - LoginRuntime.LoginCurrentTime > 1000 * 60) {
            LoginRuntime.LoginCurrentRate = 0;//超出时间重置限速
            return true;
        }
        if (LoginRuntime.LoginCurrentRate <= RateLimit) {
            LoginRuntime.LoginCurrentRate++;
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
    setQQLoginUin: async function (uin: number): Promise<void> {
        LoginRuntime.QQLoginUin = uin;
    }
    ,
    getQQLoginUin: async function (): Promise<number> {
        return LoginRuntime.QQLoginUin;
    }
}