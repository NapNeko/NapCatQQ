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
  // eslint-disable-next-line @typescript-eslint/no-misused-new
  new(listener: IKernelLoginListener): NodeIKernelLoginListener;
}

export class LoginListener implements IKernelLoginListener {
    onLoginConnected(...args: any[]): void {
    }

    onLoginDisConnected(...args: any[]): void {
    }

    onLoginConnecting(...args: any[]): void {
    }

    onQRCodeGetPicture(arg: { pngBase64QrcodeData: string, qrcodeUrl: string }): void {
    // let base64Data: string = arg.pngBase64QrcodeData
    // base64Data = base64Data.split("data:image/png;base64,")[1]
    // let buffer = Buffer.from(base64Data, 'base64')
    // console.log("onQRCodeGetPicture", arg);
    }

    onQRCodeLoginPollingStarted(...args: any[]): void {
    }

    onQRCodeSessionUserScaned(...args: any[]): void {
    }

    onQRCodeLoginSucceed(arg: QRCodeLoginSucceedResult): void {
    }

    onQRCodeSessionFailed(...args: any[]): void {
    }

    onLoginFailed(...args: any[]): void {
    }

    onLogoutSucceed(...args: any[]): void {
    }

    onLogoutFailed(...args: any[]): void {
    }

    onUserLoggedIn(...args: any[]): void {
    }

    onQRCodeSessionQuickLoginFailed(...args: any[]): void {
    }

    onPasswordLoginFailed(...args: any[]): void {
    }

    OnConfirmUnusualDeviceFailed(...args: any[]): void {
    }

    onQQLoginNumLimited(...args: any[]): void {
    }

    onLoginState(...args: any[]): void {
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
