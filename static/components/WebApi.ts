export interface OB11Config {
    httpHost: string;
    httpPort: number;
    httpPostUrls: string[];
    httpSecret: string;
    wsHost: string;
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
    token: string;
    musicSignUrl: string;
}

class WebUiApiWrapper {
    token: string = "";
    public async setOB11Config(config: OB11Config) {

    }
    public async getOB11Config(): Promise<OB11Config> {
        return {} as OB11Config;
    }
}
export const WebUiApi = new WebUiApiWrapper();