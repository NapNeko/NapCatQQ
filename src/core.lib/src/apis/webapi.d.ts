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
interface WebApiGroupNoticeFeed {
    u: number;
    fid: string;
    pubt: number;
    msg: {
        text: string;
        text_face: string;
        title: string;
    };
    type: number;
    fn: number;
    cn: number;
    vn: number;
    settings: {
        is_show_edit_card: number;
        remind_ts: number;
        tip_window_type: number;
        confirm_required: number;
    };
    read_num: number;
    is_read: number;
    is_all_confirm: number;
}
export interface WebApiGroupNoticeRet {
    ec: number;
    em: string;
    ltsm: number;
    srv_code: number;
    read_only: number;
    role: number;
    feeds: WebApiGroupNoticeFeed[];
    group: {
        group_id: number;
        class_ext: number;
    };
    sta: number;
    gln: number;
    tst: number;
    ui: any;
    server_time: number;
    svrt: number;
    ad: number;
}
export declare class WebApi {
    static getGroupMembers(GroupCode: string): Promise<WebApiGroupMember[]>;
    static setGroupNotice(GroupCode: string): Promise<void>;
    static getGrouptNotice(GroupCode: string): Promise<undefined | WebApiGroupNoticeRet>;
    static httpDataText(url?: string, method?: string, data?: string, CookiesValue?: string): Promise<string>;
    static httpDataJson<T>(url?: string, method?: string, data?: string, CookiesValue?: string): Promise<T>;
    static genBkn(sKey: string): string;
}
export {};
