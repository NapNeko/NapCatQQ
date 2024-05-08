export interface OB11Config {
    [key: string]: any,
    httpHost: "",
    httpPort: number;
    httpPostUrls: string[];
    httpSecret: "",
    wsHost: "",
    wsPort: number;
    wsReverseUrls: string[];
    enableHttp: boolean;
    enableHttpHeart: boolean;
    enableHttpPost: boolean;
    enableWs: boolean;
    enableWsReverse: boolean;
    messagePostFormat: 'array' | 'string';
    reportSelfMessage: boolean;
    enableLocalFile2Url: boolean;
    debug: boolean;
    heartInterval: number;
    token: "",
    musicSignUrl: "",
}
class WebUiApiOB11ConfigWrapper {
    private retCredential: string = "";
    async Init(Credential: string) {
        this.retCredential = Credential;
    }
    async GetOB11Config(): Promise<OB11Config> {
        let ConfigResponse = await fetch('/api/OB11Config/GetConfig', {
            method: 'POST',
            headers: {
                'Authorization': "Bearer " + this.retCredential,
                'Content-Type': 'application/json'
            }
        });
        if (ConfigResponse.status == 200) {
            let ConfigResponseJson = await ConfigResponse.json();
            if (ConfigResponseJson.code == 0) {
                return ConfigResponseJson?.data;
            }
        }
        return {} as OB11Config;
    }
    async SetOB11Config(config: OB11Config): Promise<Boolean> {
        let ConfigResponse = await fetch('/api/OB11Config/SetConfig',
            {
                method: 'POST',
                headers: {
                    'Authorization': "Bearer " + this.retCredential,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ config: JSON.stringify(config) })
            }
        );
        if (ConfigResponse.status == 200) {
            let ConfigResponseJson = await ConfigResponse.json();
            if (ConfigResponseJson.code == 0) {
                return true;
            }
        }
        return false;
    }
}
export const OB11ConfigWrapper = new WebUiApiOB11ConfigWrapper();