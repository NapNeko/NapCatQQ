export class NodeIKernelLoginListener {
  onLoginConnected (): Promise<void> | void {
  }

  onLoginDisConnected (..._args: any[]): any {
  }

  onLoginConnecting (..._args: any[]): any {
  }

  onQRCodeGetPicture (_arg: { pngBase64QrcodeData: string, qrcodeUrl: string; }): any {
    // let base64Data: string = arg.pngBase64QrcodeData
    // base64Data = base64Data.split("data:image/png;base64,")[1]
    // let buffer = Buffer.from(base64Data, 'base64')
    // console.log("onQRCodeGetPicture", arg);
  }

  onQRCodeLoginPollingStarted (..._args: any[]): any {
  }

  onQRCodeSessionUserScaned (..._args: any[]): any {
  }

  onQRCodeLoginSucceed (_arg: QRCodeLoginSucceedResult): any {
  }

  onQRCodeSessionFailed (..._args: any[]): any {
  }

  onLoginFailed (..._args: any[]): any {
  }

  onLogoutSucceed (..._args: any[]): any {
  }

  onLogoutFailed (..._args: any[]): any {
  }

  onUserLoggedIn (..._args: any[]): any {
  }

  onQRCodeSessionQuickLoginFailed (..._args: any[]): any {
  }

  onPasswordLoginFailed (..._args: any[]): any {
  }

  OnConfirmUnusualDeviceFailed (..._args: any[]): any {
  }

  onQQLoginNumLimited (..._args: any[]): any {
  }

  onLoginState (..._args: any[]): any {
  }
}

export interface QRCodeLoginSucceedResult {
  account: string;
  mainAccount: string;
  uin: string; // 拿UIN
  uid: string; // 拿UID
  nickName: string; // 一般是空的 拿不到
  gender: number;
  age: number;
  faceUrl: string;// 一般是空的 拿不到
}
