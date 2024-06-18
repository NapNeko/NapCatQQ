import { ModifyProfileParams, User, UserDetailInfoByUin } from '@/core/entities';
import { GeneralCallResult } from '@/core';
export declare class NTQQUserApi {
    static setLongNick(longNick: string): Promise<unknown>;
    static setSelfOnlineStatus(status: number, extStatus: number, batteryStatus: number): Promise<GeneralCallResult>;
    static getBuddyRecommendContactArkJson(uin: string, sencenID?: string): Promise<unknown>;
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
    static modifySelfProfile(param: ModifyProfileParams): Promise<GeneralCallResult>;
    static getCookies(domain: string): Promise<{
        [key: string]: string;
    }>;
    static getPSkey(domainList: string[]): Promise<GeneralCallResult & {
        domainPskeyMap: Map<string, string>;
    }>;
    static getRobotUinRange(): Promise<Array<any>>;
    static getQzoneCookies(): Promise<{
        [key: string]: string;
    }>;
    static getSkey(): Promise<string | undefined>;
    static getUidByUin(Uin: string): Promise<string | undefined>;
    static getUinByUid(Uid: string | undefined): Promise<string | undefined>;
    static getUserDetailInfoByUin(Uin: string): Promise<UserDetailInfoByUin>;
    static forceFetchClientKey(): Promise<import("@/core").forceFetchClientKeyRetType>;
}
