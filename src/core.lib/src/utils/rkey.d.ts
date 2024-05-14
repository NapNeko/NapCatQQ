interface ServerRkeyData {
    group_rkey: string;
    private_rkey: string;
    expired_time: number;
}
declare class RkeyManager {
    serverUrl: string;
    private rkeyData;
    constructor(serverUrl: string);
    getRkey(): Promise<ServerRkeyData>;
    isExpired(): boolean;
    refreshRkey(): Promise<any>;
}
export declare const rkeyManager: RkeyManager;
export {};
