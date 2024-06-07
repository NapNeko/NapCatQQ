import { GeneralCallResult } from '@/core';
export declare class NTQQSystemApi {
    static hasOtherRunningQQProcess(): Promise<boolean>;
    static ORCImage(filePath: string): Promise<GeneralCallResult>;
    static translateEnWordToZn(words: string[]): Promise<GeneralCallResult & {
        words: string[];
    }>;
    static getOnlineDev(): Promise<any>;
    static getArkJsonCollection(cid: string): Promise<GeneralCallResult & {
        arkJson: string;
    }>;
}
