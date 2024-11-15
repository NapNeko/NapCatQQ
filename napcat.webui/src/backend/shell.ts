export class QQLoginManager {
    private retCredential: string;
    private apiprefix: string;

    constructor(retCredential: string, apiprefix: string = 'http://127.0.0.1:6099/api') {
        this.retCredential = retCredential;
        this.apiprefix = apiprefix;
    }
    public async GetOB11Config(): Promise<any> {
        try {
            const ConfigResponse = await fetch(`${this.apiprefix}/OB11Config/GetConfig`, {
                method: 'POST',
                headers: {
                    Authorization: 'Bearer ' + this.retCredential,
                    'Content-Type': 'application/json',
                },
            });
            if (ConfigResponse.status == 200) {
                const ConfigResponseJson = await ConfigResponse.json();
                if (ConfigResponseJson.code == 0) {
                    return ConfigResponseJson?.data;
                }
            }
        } catch (error) {
            console.error("Error getting OB11 config:", error);
        }
        return {};
    }

    public async SetOB11Config(config: any): Promise<boolean> {
        try {
            const ConfigResponse = await fetch(`${this.apiprefix}/OB11Config/SetConfig`, {
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
            console.error("Error setting OB11 config:", error);
        }
        return false;
    }

    public async checkQQLoginStatus(): Promise<boolean> {
        try {
            let QQLoginResponse = await fetch(`${this.apiprefix}/QQLogin/CheckLoginStatus`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.retCredential,
                    'Content-Type': 'application/json'
                }
            });
            if (QQLoginResponse.status == 200) {
                let QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data.isLogin;
                }
            }
        } catch (error) {
            console.error("Error checking QQ login status:", error);
        }
        return false;
    }

    public async checkWebUiLogined(): Promise<boolean> {
        try {
            let LoginResponse = await fetch(`${this.apiprefix}/auth/check`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.retCredential,
                    'Content-Type': 'application/json'
                }
            });
            if (LoginResponse.status == 200) {
                let LoginResponseJson = await LoginResponse.json();
                if (LoginResponseJson.code == 0) {
                    return true;
                }
            }
        } catch (error) {
            console.error("Error checking web UI login status:", error);
        }
        return false;
    }

    public async loginWithToken(token: string): Promise<string | null> {
        try {
            let loginResponse = await fetch(`${this.apiprefix}/auth/login`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ token: token })
            });
            const loginResponseJson = await loginResponse.json();
            let retCode = loginResponseJson.code;
            if (retCode === 0) {
                this.retCredential = loginResponseJson.data.Credential;
                return this.retCredential;
            }
        } catch (error) {
            console.error("Error logging in with token:", error);
        }
        return null;
    }

    public async getQQLoginQrcode(): Promise<string> {
        try {
            let QQLoginResponse = await fetch(`${this.apiprefix}/QQLogin/GetQQLoginQrcode`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.retCredential,
                    'Content-Type': 'application/json'
                }
            });
            if (QQLoginResponse.status == 200) {
                let QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data.qrcode || "";
                }
            }
        } catch (error) {
            console.error("Error getting QQ login QR code:", error);
        }
        return "";
    }

    public async getQQQuickLoginList(): Promise<string[]> {
        try {
            let QQLoginResponse = await fetch(`${this.apiprefix}/QQLogin/GetQuickLoginList`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.retCredential,
                    'Content-Type': 'application/json'
                }
            });
            if (QQLoginResponse.status == 200) {
                let QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return QQLoginResponseJson.data || [];
                }
            }
        } catch (error) {
            console.error("Error getting QQ quick login list:", error);
        }
        return [];
    }

    public async setQuickLogin(uin: string): Promise<{ result: boolean, errMsg: string }> {
        try {
            let QQLoginResponse = await fetch(`${this.apiprefix}/QQLogin/SetQuickLogin`, {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.retCredential,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ uin: uin })
            });
            if (QQLoginResponse.status == 200) {
                let QQLoginResponseJson = await QQLoginResponse.json();
                if (QQLoginResponseJson.code == 0) {
                    return { result: true, errMsg: "" };
                } else {
                    return { result: false, errMsg: QQLoginResponseJson.message };
                }
            }
        } catch (error) {
            console.error("Error setting quick login:", error);
        }
        return { result: false, errMsg: "接口异常" };
    }
}