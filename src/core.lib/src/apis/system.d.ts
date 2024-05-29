export declare class NTQQSystemApi {
    static hasOtherRunningQQProcess(): Promise<boolean>;
    static ORCImage(filePath: string): Promise<import("@/core").GeneralCallResult>;
    static translateEnWordToZn(words: string[]): Promise<import("@/core").GeneralCallResult & {
        words: string[];
    }>;
}
