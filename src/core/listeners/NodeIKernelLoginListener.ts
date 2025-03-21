export class NodeIKernelLoginListener {
    onLoginConnected(): Promise<void> | void {
    }

    onLoginDisConnected(...args: any[]): any {
    }

    onLoginConnecting(...args: any[]): any {
    }

    onQRCodeGetPicture(arg: { pngBase64QrcodeData: string, qrcodeUrl: string }): any {
        // let base64Data: string = arg.pngBase64QrcodeData
        // base64Data = base64Data.split("data:image/png;base64,")[1]
        // let buffer = Buffer.from(base64Data, 'base64')
        // console.log("onQRCodeGetPicture", arg);
    }

    onQRCodeLoginPollingStarted(...args: any[]): any {
    }

    onQRCodeSessionUserScaned(...args: any[]): any {
    }

    onQRCodeLoginSucceed(arg: QRCodeLoginSucceedResult): any {
    }

    onQRCodeSessionFailed(...args: any[]): any {
    }

    onLoginFailed(...args: any[]): any {
    }

    onLogoutSucceed(...args: any[]): any {
    }

    onLogoutFailed(...args: any[]): any {
    }

    onUserLoggedIn(...args: any[]): any {
    }

    onQRCodeSessionQuickLoginFailed(...args: any[]): any {
    }

    onPasswordLoginFailed(...args: any[]): any {
    }

    OnConfirmUnusualDeviceFailed(...args: any[]): any {
    }

    onQQLoginNumLimited(...args: any[]): any {
    }

    onLoginState(...args: any[]): any {
    }
}

export interface QRCodeLoginSucceedResult {
    account: string;
    mainAccount: string;
    uin: string; //拿UIN
    uid: string; //拿UID
    nickName: string; //一般是空的 拿不到
    gender: number;
    age: number;
    faceUrl: string;//一般是空的 拿不到
}
