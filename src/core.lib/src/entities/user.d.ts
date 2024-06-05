export declare enum Sex {
    male = 1,
    female = 2,
    unknown = 255
}
export interface BuddyCategoryType {
    categoryId: number;
    categroyName: string;
    categroyMbCount: number;
    buddyList: User[];
}
export interface ModifyProfileParams {
    nick: string;
    longNick: string;
    sex: Sex;
    birthday: {
        birthday_year: string;
        birthday_month: string;
        birthday_day: string;
    };
    location: any;
}
export interface BuddyProfileLikeReq {
    friendUids: string[];
    basic: number;
    vote: number;
    favorite: number;
    userProfile: number;
    type: number;
    start: number;
    limit: number;
}
export interface QQLevel {
    crownNum: number;
    sunNum: number;
    moonNum: number;
    starNum: number;
}
export interface User {
    uid: string;
    uin: string;
    nick: string;
    avatarUrl?: string;
    longNick?: string;
    remark?: string;
    sex?: Sex;
    qqLevel?: QQLevel;
    qid?: string;
    birthday_year?: number;
    birthday_month?: number;
    birthday_day?: number;
    topTime?: string;
    constellation?: number;
    shengXiao?: number;
    kBloodType?: number;
    homeTown?: string;
    makeFriendCareer?: number;
    pos?: string;
    eMail?: string;
    phoneNum?: string;
    college?: string;
    country?: string;
    province?: string;
    city?: string;
    postCode?: string;
    address?: string;
    isBlock?: boolean;
    isSpecialCareOpen?: boolean;
    isSpecialCareZone?: boolean;
    ringId?: string;
    regTime?: number;
    interest?: string;
    labels?: string[];
    isHideQQLevel?: number;
    privilegeIcon?: {
        jumpUrl: string;
        openIconList: unknown[];
        closeIconList: unknown[];
    };
    photoWall?: {
        picList: unknown[];
    };
    vipFlag?: boolean;
    yearVipFlag?: boolean;
    svipFlag?: boolean;
    vipLevel?: number;
    status?: number;
    qidianMasterFlag?: number;
    qidianCrewFlag?: number;
    qidianCrewFlag2?: number;
    extStatus?: number;
    recommendImgFlag?: number;
    disableEmojiShortCuts?: number;
    pendantId?: string;
}
export interface SelfInfo extends User {
    online?: boolean;
}
export interface Friend extends User {
}
export interface UserDetailInfoByUin {
    result: number;
    errMsg: string;
    info: {
        uid: string;
        qid: string;
        uin: string;
        nick: string;
        remark: string;
        longNick: string;
        avatarUrl: string;
        birthday_year: number;
        birthday_month: number;
        birthday_day: number;
        sex: number;
        topTime: string;
        constellation: number;
        shengXiao: number;
        kBloodType: number;
        homeTown: string;
        makeFriendCareer: number;
        pos: string;
        eMail: string;
        phoneNum: string;
        college: string;
        country: string;
        province: string;
        city: string;
        postCode: string;
        address: string;
        isBlock: boolean;
        isSpecialCareOpen: boolean;
        isSpecialCareZone: boolean;
        ringId: string;
        regTime: number;
        interest: string;
        termType: number;
        labels: any[];
        qqLevel: {
            crownNum: number;
            sunNum: number;
            moonNum: number;
            starNum: number;
        };
        isHideQQLevel: number;
        privilegeIcon: {
            jumpUrl: string;
            openIconList: any[];
            closeIconList: any[];
        };
        isHidePrivilegeIcon: number;
        photoWall: {
            picList: any[];
        };
        vipFlag: boolean;
        yearVipFlag: boolean;
        svipFlag: boolean;
        vipLevel: number;
        status: number;
        qidianMasterFlag: number;
        qidianCrewFlag: number;
        qidianCrewFlag2: number;
        extStatus: number;
        recommendImgFlag: number;
        disableEmojiShortCuts: number;
        pendantId: string;
        vipNameColorId: string;
    };
}
