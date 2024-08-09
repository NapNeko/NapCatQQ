import { ConfigBase } from '@/common/utils/ConfigBase';

export interface OB11Config {
  http: {
    enable: boolean;
    host: string;
    port: number;
    secret: string;
    enableHeart: boolean;
    enablePost: boolean;
    postUrls: string[];
  };
  ws: {
    enable: boolean;
    host: string;
    port: number;
  };
  reverseWs: {
    enable: boolean;
    urls: string[];
  };

  debug: boolean;
  heartInterval: number;
  messagePostFormat: 'array' | 'string';
  enableLocalFile2Url: boolean;
  musicSignUrl: string;
  reportSelfMessage: boolean;
  token: string;
  GroupLocalTime: {
    Record: boolean,
    RecordList: Array<string>
  }
}

export class OB11Config extends ConfigBase<OB11Config>  {
    name = 'onebot11';
    protected getKeys(): string[] | null {
        return null;
    }
}
