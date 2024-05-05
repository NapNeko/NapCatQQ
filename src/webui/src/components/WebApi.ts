export interface OB11Config {
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

class WebUiApiWrapper {
    token: string = "";
    public async setOB11Config(config: OB11Config) {

    }
    public async getOB11Config(): Promise<OB11Config> {
        // 返回示例配置
        return {
            httpHost: "",
            httpPort: 3000,
            httpPostUrls: [],
            httpSecret: "",
            wsHost: "",
            wsPort: 3000,
            wsReverseUrls: [],
            enableHttp: false,
            enableHttpHeart: false,
            enableHttpPost: false,
            enableWs: false,
            enableWsReverse: false,
            messagePostFormat: 'array',
            reportSelfMessage: false,
            enableLocalFile2Url: false,
            debug: false,
            heartInterval: 60000,
            token: "",
            musicSignUrl: "",
        };
    }
}
export const WebUiApi = new WebUiApiWrapper();