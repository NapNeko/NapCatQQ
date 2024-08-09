import fs from 'node:fs';
import path from 'node:path';
import { ConfigBase } from '@/common/utils/ConfigBase';

// export interface OB11Config {
//   http: {
//     enable: boolean;
//     host: string;
//     port: number;
//     secret: string;
//     enableHeart: boolean;
//     enablePost: boolean;
//     postUrls: string[];
//   };
//   ws: {
//     enable: boolean;
//     host: string;
//     port: number;
//   };
//   reverseWs: {
//     enable: boolean;
//     urls: string[];
//   };

//   debug: boolean;
//   heartInterval: number;
//   messagePostFormat: 'array' | 'string';
//   enableLocalFile2Url: boolean;
//   musicSignUrl: string;
//   reportSelfMessage: boolean;
//   token: string;
//   GroupLocalTime: {
//     Record: boolean,
//     RecordList: Array<string>
//   },
//   read(): OB11Config;

//   save(config: OB11Config): void;
// }

export class OB11Config extends ConfigBase<OB11Config>  {
    name: string = 'onebot11';
    http = {
        enable: false,
        host: '',
        port: 3000,
        secret: '',
        enableHeart: false,
        enablePost: false,
        postUrls: [],
    };
    ws = {
        enable: false,
        host: '',
        port: 3001,
    };
    reverseWs = {
        enable: false,
        urls: [],
    };
    debug = false;
    heartInterval = 30000;
    messagePostFormat: 'array' | 'string' = 'array';
    enableLocalFile2Url = true;
    musicSignUrl = '';
    reportSelfMessage = false;
    token = '';
    GroupLocalTime = {
        Record: false,
        RecordList: [] as Array<string>
    };

    protected getKeys(): string[] | null {
        return null;
    }
}
