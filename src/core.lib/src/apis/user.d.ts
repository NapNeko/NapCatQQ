import { User } from '@/core/entities';
import { GeneralCallResult } from '@/core';
export declare class NTQQUserApi {
    static setSelfOnlineStatus(status: number, extStatus: number, batteryStatus: number): Promise<GeneralCallResult>;
    static like(uid: string, count?: number): Promise<{
        result: number;
        errMsg: string;
        succCounts: number;
    }>;
    static setQQAvatar(filePath: string): Promise<{
        result: number;
        errMsg: string;
    }>;
    static getSelfInfo(): Promise<void>;
    static getUserInfo(uid: string): Promise<void>;
    static getUserDetailInfo(uid: string): Promise<User>;
    static getPSkey(domainList: string[]): Promise<Object>;
    static getRobotUinRange(): Promise<Array<any>>;
    static getSkey(): Promise<string | undefined>;
}
