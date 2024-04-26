export declare class WebApi {
    private static bkn;
    private static skey;
    private static pskey;
    private static cookie;
    private defaultHeaders;
    constructor();
    addGroupDigest(groupCode: string, msgSeq: string): Promise<any>;
    getGroupDigest(groupCode: string): Promise<any>;
    private genBkn;
    private init;
    private request;
}
