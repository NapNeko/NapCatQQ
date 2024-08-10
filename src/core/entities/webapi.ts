export enum WebHonorType {
    ALL = 'all',
    /**
     * 群聊之火
     */
    TALKATIVE = 'talkative',
    /**
     * 群聊炽焰
     */
    PERFORMER = 'performer',
    /**
     * 龙王
     */
    LEGEND = 'legend',
    /**
     * 冒尖小春笋（R.I.P）
     */
    STRONG_NEWBIE = 'strong_newbie',
    /**
     * 快乐源泉
     */
    EMOTION = 'emotion'
}

export interface WebApiGroupMember {
    uin: number;
    role: number;
    g: number;
    join_time: number;
    last_speak_time: number;
    lv: {
        point: number
        level: number
    };
    card: string;
    tags: string;
    flag: number;
    nick: string;
    qage: number;
    rm: number;
}

export interface WebApiGroupMemberRet {
    ec: number;
    errcode: number;
    em: string;
    cache: number;
    adm_num: number;
    levelname: any;
    mems: WebApiGroupMember[];
    count: number;
    svr_time: number;
    max_count: number;
    search_count: number;
    extmode: number;
}

export interface WebApiGroupNoticeFeed {
    u: number;//发送者
    fid: string;//fid
    pubt: number;//时间
    msg: {
        text: string
        text_face: string
        title: string,
        pics?: {
            id: string,
            w: string,
            h: string
        }[]
    };
    type: number;
    fn: number;
    cn: number;
    vn: number;
    settings: {
        is_show_edit_card: number
        remind_ts: number
        tip_window_type: number
        confirm_required: number
    };
    read_num: number;
    is_read: number;
    is_all_confirm: number;
}

export interface WebApiGroupNoticeRet {
    ec: number
    em: string
    ltsm: number
    srv_code: number
    read_only: number
    role: number
    feeds: WebApiGroupNoticeFeed[]
    group: {
        group_id: number
        class_ext: number
    }
    sta: number,
    gln: number
    tst: number,
    ui: any
    server_time: number
    svrt: number
    ad: number
}

export interface GroupEssenceMsg {
    group_code: string;
    msg_seq: number;
    msg_random: number;
    sender_uin: string;
    sender_nick: string;
    sender_time: number;
    add_digest_uin: string;
    add_digest_nick: string;
    add_digest_time: number;
    msg_content: any[];
    can_be_removed: true;
}

export interface GroupEssenceMsgRet {
    retcode: number;
    retmsg: string;
    data: {
        msg_list: GroupEssenceMsg[]
        is_end: boolean
        group_role: number
        config_page_url: string
    };
}
