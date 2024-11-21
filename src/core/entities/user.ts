// 性别枚举
export enum Sex {
    male = 1,
    female = 2,
    unknown = 255,
}

// 好友分类类型
export interface BuddyCategoryType {
    categoryId: number;
    categoryName: string;
    categoryMbCount: number;
    buddyList: User[];
}

// 核心信息
export interface CoreInfo {
    uid: string;
    uin: string;
    nick: string;
    remark: string;
}

// 基本信息
export interface BaseInfo {
    qid: string;
    longNick: string;
    birthdayYear: number;
    birthdayMonth: number;
    birthdayDay: number;
    age: number;
    sex: number;
    email: string;
    phoneNum: string;
    categoryId: number;
    richTime: number;
    richBuffer: string;
}

// 音乐信息
interface MusicInfo {
    buf: string;
}

// 视频业务信息
interface VideoBizInfo {
    cid: string;
    tvUrl: string;
    synchType: string;
}

// 视频信息
interface VideoInfo {
    name: string;
}

// 扩展在线业务信息
interface ExtOnlineBusinessInfo {
    buf: string;
    customStatus: any;
    videoBizInfo: VideoBizInfo;
    videoInfo: VideoInfo;
}

// 扩展缓冲区
interface ExtBuffer {
    buf: string;
}

// 用户状态
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

// 特权图标
interface PrivilegeIcon {
    jumpUrl: string;
    openIconList: any[];
    closeIconList: any[];
}

// 增值服务信息
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

// 关系标志
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

// 通用扩展信息
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

// 好友列表请求类型枚举
export enum BuddyListReqType {
    KNOMAL,
    KLETTER
}

// 图片信息
interface Pic {
    picId: string;
    picTime: number;
    picUrlMap: Record<string, string>;
}

// 照片墙
interface PhotoWall {
    picList: Pic[];
}

// 简单信息
export interface SimpleInfo {
    uid?: string;
    uin?: string;
    coreInfo: CoreInfo;
    baseInfo: BaseInfo;
    status: UserStatus | null;
    vasInfo: VasInfo | null;
    relationFlags: RelationFlags | null;
    otherFlags: any;
    intimate: any;
}

// 好友类型
export type FriendV2 = SimpleInfo;

// 自身状态信息
export interface SelfStatusInfo {
    uid: string;
    status: number;
    extStatus: number;
    termType: number;
    netType: number;
    iconType: number;
    customStatus: any;
    setTime: string;
}

// 用户详细信息监听参数
export interface UserDetailInfoListenerArg {
    uid: string;
    uin: string;
    simpleInfo: SimpleInfo;
    commonExt: CommonExt;
    photoWall: PhotoWall;
}

// 修改个人资料参数
export interface ModifyProfileParams {
    nick: string;
    longNick: string;
    sex: Sex;
    birthday: { birthdayYear: string, birthdayMonth: string, birthdayDay: string };
    location: any;
}

// 好友资料点赞请求
export interface BuddyProfileLikeReq {
    friendUids: string[];
    basic: number;
    vote: number;
    favorite: number;
    userProfile: number;
    type: number;
    start: number;
    limit?: number;
}

// QQ等级信息
export interface QQLevel {
    crownNum: number;
    sunNum: number;
    moonNum: number;
    starNum: number;
}

// 用户信息
export interface User {
    uid: string;
    uin: string;
    nick: string;
    avatarUrl?: string;
    longNick?: string;
    remark?: string;
    sex?: Sex;
    age?: number;
    qqLevel?: QQLevel;
    qid?: string;
    birthdayYear?: number;
    birthdayMonth?: number;
    birthdayDay?: number;
    topTime?: string;
    constellation?: number;
    shengXiao?: number;
    kBloodType?: number;
    homeTown?: string;
    makeFriendCareer?: number;
    pos?: string;
    email?: string;
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

// 自身信息
export interface SelfInfo extends User {
    online?: boolean;
}

// 好友类型
export type Friend = User;

// 业务键枚举
export enum BizKey {
    KPRIVILEGEICON,
    KPHOTOWALL
}

// 根据UIN获取用户详细信息
export interface UserDetailInfoByUin {
    result: number;
    errMsg: string;
    detail: {
        uid: string;
        uin: string;
        simpleInfo: SimpleInfo;
        commonExt: CommonExt;
        photoWall: null;
    };
}

// 用户详细信息来源枚举
export enum UserDetailSource {
    KDB,
    KSERVER
}

// 个人资料业务类型枚举
export enum ProfileBizType {
    KALL,
    KBASEEXTEND,
    KVAS,
    KQZONE,
    KOTHER
}