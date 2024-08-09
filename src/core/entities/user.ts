export enum Sex {
    male = 1,
    female = 2,
    unknown = 255,
}
export interface BuddyCategoryType {
    categoryId: number;
    categroyName: string;
    categroyMbCount: number;
    buddyList: User[];
}
export interface CoreInfo {
    uid: string;
    uin: string;
    nick: string;
    remark: string;
}

export interface BaseInfo {
    qid: string;
    longNick: string;
    birthday_year: number;
    birthday_month: number;
    birthday_day: number;
    age: number;
    sex: number;
    eMail: string;
    phoneNum: string;
    categoryId: number;
    richTime: number;
    richBuffer: string;
}

interface MusicInfo {
    buf: string;
}

interface VideoBizInfo {
    cid: string;
    tvUrl: string;
    synchType: string;
}

interface VideoInfo {
    name: string;
}

interface ExtOnlineBusinessInfo {
    buf: string;
    customStatus: any;
    videoBizInfo: VideoBizInfo;
    videoInfo: VideoInfo;
}

interface ExtBuffer {
    buf: string;
}

interface UserStatus {
    uid: string;
    uin: string;
    status: number;
    extStatus: number;
    batteryStatus: number;
    termType: number;
    netType: number;
    iconType: number;
    customStatus: any;
    setTime: string;
    specialFlag: number;
    abiFlag: number;
    eNetworkType: number;
    showName: string;
    termDesc: string;
    musicInfo: MusicInfo;
    extOnlineBusinessInfo: ExtOnlineBusinessInfo;
    extBuffer: ExtBuffer;
}

interface PrivilegeIcon {
    jumpUrl: string;
    openIconList: any[];
    closeIconList: any[];
}

interface VasInfo {
    vipFlag: boolean;
    yearVipFlag: boolean;
    svipFlag: boolean;
    vipLevel: number;
    bigClub: boolean;
    bigClubLevel: number;
    nameplateVipType: number;
    grayNameplateFlag: number;
    superVipTemplateId: number;
    diyFontId: number;
    pendantId: number;
    pendantDiyId: number;
    faceId: number;
    vipFont: number;
    vipFontType: number;
    magicFont: number;
    fontEffect: number;
    newLoverDiamondFlag: number;
    extendNameplateId: number;
    diyNameplateIDs: any[];
    vipStartFlag: number;
    vipDataFlag: number;
    gameNameplateId: string;
    gameLastLoginTime: string;
    gameRank: number;
    gameIconShowFlag: boolean;
    gameCardId: string;
    vipNameColorId: string;
    privilegeIcon: PrivilegeIcon;
}

interface RelationFlags {
    topTime: string;
    isBlock: boolean;
    isMsgDisturb: boolean;
    isSpecialCareOpen: boolean;
    isSpecialCareZone: boolean;
    ringId: string;
    isBlocked: boolean;
    recommendImgFlag: number;
    disableEmojiShortCuts: number;
    qidianMasterFlag: number;
    qidianCrewFlag: number;
    qidianCrewFlag2: number;
    isHideQQLevel: number;
    isHidePrivilegeIcon: number;
}


interface CommonExt {
    constellation: number;
    shengXiao: number;
    kBloodType: number;
    homeTown: string;
    makeFriendCareer: number;
    pos: string;
    college: string;
    country: string;
    province: string;
    city: string;
    postCode: string;
    address: string;
    regTime: number;
    interest: string;
    labels: any[];
    qqLevel: QQLevel;
}

interface Pic {
    picId: string;
    picTime: number;
    picUrlMap: Record<string, string>;
}

interface PhotoWall {
    picList: Pic[];
}

export interface SimpleInfo {
    uid?: string;
    uin?: string;
    coreInfo: CoreInfo;
    baseInfo: BaseInfo;
    status: UserStatus | null;
    vasInfo: VasInfo | null;
    relationFlags: RelationFlags | null;
    otherFlags: any | null;
    intimate: any | null;
}
export interface FriendV2 extends SimpleInfo {
    categoryId?: number;
    categroyName?: string;
}
export interface UserDetailInfoListenerArg {
    uid: string;
    uin: string;
    simpleInfo: SimpleInfo;
    commonExt: CommonExt;
    photoWall: PhotoWall;
}
export interface ModifyProfileParams {
    nick: string,
    longNick: string,
    sex: Sex,
    birthday: { birthday_year: string, birthday_month: string, birthday_day: string },
    location: any//undefined
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
    starNum: number
}

export interface User {
    uid: string; // 加密的字符串
    uin: string; // QQ号
    nick: string;
    avatarUrl?: string;
    longNick?: string; // 签名
    remark?: string;
    sex?: Sex;
    qqLevel?: QQLevel;
    qid?: string
    birthday_year?: number;
    birthday_month?: number;
    birthday_day?: number;
    topTime?: string;
    constellation?: number;
    shengXiao?: number;
    kBloodType?: number;
    homeTown?: string; //"0-0-0";
    makeFriendCareer?: number;
    pos?: string;
    eMail?: string
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
        closeIconList: unknown[]
    };
    photoWall?: {
        picList: unknown[]
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

export interface Friend extends User { }

export enum BizKey {
    KPRIVILEGEICON,
    KPHOTOWALL
}
export interface UserDetailInfoByUinV2 {
    result: number,
    errMsg: string,
    detail: {
        uid: string,
        uin: string,
        simpleInfo: SimpleInfo,
        commonExt: CommonExt,
        photoWall: null
    }
}
export interface UserDetailInfoByUin {
    result: number,
    errMsg: string,
    info: {
        uid: string,//这个没办法用
        qid: string,
        uin: string,
        nick: string,
        remark: string,
        longNick: string,
        avatarUrl: string,
        birthday_year: number,
        birthday_month: number,
        birthday_day: number,
        sex: number,//0
        topTime: string,
        constellation: number,
        shengXiao: number,
        kBloodType: number,
        homeTown: string,
        makeFriendCareer: number,
        pos: string,
        eMail: string,
        phoneNum: string,
        college: string,
        country: string,
        province: string,
        city: string,
        postCode: string,
        address: string,
        isBlock: boolean,
        isSpecialCareOpen: boolean,
        isSpecialCareZone: boolean,
        ringId: string,
        regTime: number,
        interest: string,
        termType: number,
        labels: any[],
        qqLevel: { crownNum: number, sunNum: number, moonNum: number, starNum: number },
        isHideQQLevel: number,
        privilegeIcon: { jumpUrl: string, openIconList: any[], closeIconList: any[] },
        isHidePrivilegeIcon: number,
        photoWall: { picList: any[] },
        vipFlag: boolean,
        yearVipFlag: boolean,
        svipFlag: boolean,
        vipLevel: number,
        status: number,
        qidianMasterFlag: number,
        qidianCrewFlag: number,
        qidianCrewFlag2: number,
        extStatus: number,
        recommendImgFlag: number,
        disableEmojiShortCuts: number,
        pendantId: string,
        vipNameColorId: string
    }
}