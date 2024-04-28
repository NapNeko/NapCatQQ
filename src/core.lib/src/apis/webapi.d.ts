interface WebApiGroupMember {
    uin: number;
    role: number;
    g: number;
    join_time: number;
    last_speak_time: number;
    lv: {
        point: number;
        level: number;
    };
    card: string;
    tags: string;
    flag: number;
    nick: string;
    qage: number;
    rm: number;
}
export declare class WebApi {
    static getGroupMembers(GroupCode: string): Promise<WebApiGroupMember[]>;
    static postData(url?: string, data?: string, CookiesValue?: string): Promise<unknown>;
    static genBkn(sKey: string): string;
}
export {};
