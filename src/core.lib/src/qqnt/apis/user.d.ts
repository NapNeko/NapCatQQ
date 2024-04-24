import { User } from '@/core/qqnt/entities';
export declare class NTQQUserApi {
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
    static getPSkey(): Promise<void>;
    static getSkey(groupName: string, groupCode: string): Promise<void | {
        data: string;
    }>;
}
