export interface IKernelLoginListener {
    onLoginConnected(...args: any[]): void;
    onLoginDisConnected(...args: any[]): void;
    onLoginConnecting(...args: any[]): void;
    onQRCodeGetPicture(...args: any[]): void;
    onQRCodeLoginPollingStarted(...args: any[]): void;
    onQRCodeSessionUserScaned(...args: any[]): void;
    onQRCodeLoginSucceed(...args: any[]): void;
    onQRCodeSessionFailed(...args: any[]): void;
    onLoginFailed(...args: any[]): void;
    onLogoutSucceed(...args: any[]): void;
    onLogoutFailed(...args: any[]): void;
    onUserLoggedIn(...args: any[]): void;
    onQRCodeSessionQuickLoginFailed(...args: any[]): void;
    onPasswordLoginFailed(...args: any[]): void;
    OnConfirmUnusualDeviceFailed(...args: any[]): void;
    onQQLoginNumLimited(...args: any[]): void;
    onLoginState(...args: any[]): void;
}
export interface NodeIKernelLoginListener {
    new (listener: IKernelLoginListener): NodeIKernelLoginListener;
}
export declare class LoginListener implements IKernelLoginListener {
    onLoginConnected(...args: any[]): void;
    onLoginDisConnected(...args: any[]): void;
    onLoginConnecting(...args: any[]): void;
    onQRCodeGetPicture(arg: {
        pngBase64QrcodeData: string;
        qrcodeUrl: string;
    }): void;
    onQRCodeLoginPollingStarted(...args: any[]): void;
    onQRCodeSessionUserScaned(...args: any[]): void;
    onQRCodeLoginSucceed(...args: any[]): void;
    onQRCodeSessionFailed(...args: any[]): void;
    onLoginFailed(...args: any[]): void;
    onLogoutSucceed(...args: any[]): void;
    onLogoutFailed(...args: any[]): void;
    onUserLoggedIn(...args: any[]): void;
    onQRCodeSessionQuickLoginFailed(...args: any[]): void;
    onPasswordLoginFailed(...args: any[]): void;
    OnConfirmUnusualDeviceFailed(...args: any[]): void;
    onQQLoginNumLimited(...args: any[]): void;
    onLoginState(...args: any[]): void;
}
