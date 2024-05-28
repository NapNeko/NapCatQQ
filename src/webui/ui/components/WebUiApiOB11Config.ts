export interface OB11Config {
  [key: string]: any;
  http: {
    enable: boolean;
    host: '';
    port: number;
    secret: '';
    enableHeart: boolean;
    enablePost: boolean;
    postUrls: string[];
  };
  ws: {
    enable: boolean;
    host: '';
    port: number;
  };
  reverseWs: {
    enable: boolean;
    urls: string[];
  };
  GroupLocalTime: {
    Record: boolean,
    RecordList: Array<string>
  };
  debug: boolean;
  heartInterval: number;
  messagePostFormat: 'array' | 'string';
  enableLocalFile2Url: boolean;
  musicSignUrl: '';
  reportSelfMessage: boolean;
  token: '';

}

class WebUiApiOB11ConfigWrapper {
  private retCredential: string = '';
  async Init(Credential: string) {
    this.retCredential = Credential;
  }
  async GetOB11Config(): Promise<OB11Config> {
    const ConfigResponse = await fetch('/api/OB11Config/GetConfig', {
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
    return {} as OB11Config;
  }
  async SetOB11Config(config: OB11Config): Promise<boolean> {
    const ConfigResponse = await fetch('/api/OB11Config/SetConfig', {
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
    return false;
  }
}
export const OB11ConfigWrapper = new WebUiApiOB11ConfigWrapper();
