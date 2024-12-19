import { OneBotConfig } from '../../../src/onebot/config/config';
import { ResponseCode } from '../../../src/webui/src/const/status';
export class QQLoginManager {
    private retCredential: string;
    private readonly apiPrefix: string;

    //调试时http://127.0.0.1:6099/api 打包时 ../api
    constructor(retCredential: string, apiPrefix: string = '../api') {
        this.retCredential = retCredential;
        this.apiPrefix = apiPrefix;
    }

    // TODO:
    public async GetOB11Config(): Promise<OneBotConfig> {
        try {
            const ConfigResponse = await fetch(`${this.apiPrefix}/OB11Config/GetConfig`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                const ConfigResponseJson = await ConfigResponse.json();
                if (ConfigResponseJson.code == ResponseCode.Success) {
                    return ConfigResponseJson.data;
                }
            }
        } catch (error) {
            console.error('Error getting OB11 config:', error);
        }
        return {} as OneBotConfig;
    }

    public async SetOB11Config(config: OneBotConfig): Promise<boolean> {
        try {
            const ConfigResponse = await fetch(`${this.apiPrefix}/OB11Config/SetConfig`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ config: JSON.stringify(config) }),
            });
            if (ConfigResponse.status == 200) {
                const ConfigResponseJson = await ConfigResponse.json();
                if (ConfigResponseJson.code == 0) {
                    return true;
                }
            }
        } catch (error) {
            console.error('Error setting OB11 config:', error);
        }
        return false;
    }

    public async checkQQLoginStatus(): Promise<boolean> {
        try {
            const QQLoginResponse = await fetch(`${this.apiPrefix}/QQLogin/CheckLoginStatus`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (QQLoginResponse.status == 200) {
                const QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data.isLogin;
                }
            }
        } catch (error) {
            console.error('Error checking QQ login status:', error);
        }
        return false;
    }
    public async checkQQLoginStatusWithQrcode(): Promise<{ qrcodeurl: string; isLogin: string } | undefined> {
        try {
            const QQLoginResponse = await fetch(`${this.apiPrefix}/QQLogin/CheckLoginStatus`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (QQLoginResponse.status == 200) {
                const QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data;
                }
            }
        } catch (error) {
            console.error('Error checking QQ login status:', error);
        }
        return undefined;
    }

    public async checkWebUiLogined(): Promise<boolean> {
        try {
            const LoginResponse = await fetch(`${this.apiPrefix}/auth/check`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (LoginResponse.status == 200) {
                const LoginResponseJson = await LoginResponse.json();
                if (LoginResponseJson.code == 0) {
                    return true;
                }
            }
        } catch (error) {
            console.error('Error checking web UI login status:', error);
        }
        return false;
    }

    public async loginWithToken(token: string): Promise<string | null> {
        try {
            const loginResponse = await fetch(`${this.apiPrefix}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ token: token }),
            });
            const loginResponseJson = await loginResponse.json();
            const retCode = loginResponseJson.code;
            if (retCode === 0) {
                this.retCredential = loginResponseJson.data.Credential;
                return this.retCredential;
            }
        } catch (error) {
            console.error('Error logging in with token:', error);
        }
        return null;
    }

    public async getQQLoginQrcode(): Promise<string> {
        try {
            const QQLoginResponse = await fetch(`${this.apiPrefix}/QQLogin/GetQQLoginQrcode`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (QQLoginResponse.status == 200) {
                const QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data.qrcode || '';
                }
            }
        } catch (error) {
            console.error('Error getting QQ login QR code:', error);
        }
        return '';
    }

    public async getQQLoginInfo(): Promise<object | ''> {
        try {
            const QQLoginResponse = await fetch(`${this.apiPrefix}/QQLogin/GetQQLoginInfo`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (QQLoginResponse.status == 200) {
                const QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data || '';
                }
            }
        } catch (error) {
            console.error('Error getting QQ login Info:', error);
        }
        return '';
    }

    public async getQQQuickLoginList(): Promise<string[]> {
        try {
            const QQLoginResponse = await fetch(`${this.apiPrefix}/QQLogin/GetQuickLoginList`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (QQLoginResponse.status == 200) {
                const QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data || [];
                }
            }
        } catch (error) {
            console.error('Error getting QQ quick login list:', error);
        }
        return [];
    }

    public async setQuickLogin(uin: string): Promise<{ result: boolean; errMsg: string }> {
        try {
            const QQLoginResponse = await fetch(`${this.apiPrefix}/QQLogin/SetQuickLogin`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ uin: uin }),
            });
            if (QQLoginResponse.status == 200) {
                const QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return { result: true, errMsg: '' };
                } else {
                    return { result: false, errMsg: QQLoginResponseJson.message };
                }
            }
        } catch (error) {
            console.error('Error setting quick login:', error);
        }
        return { result: false, errMsg: '接口异常' };
    }
}
