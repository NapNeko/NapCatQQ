import { NTGroupMemberRole } from '@/core';
import { ActionBarElement, ArkElement, AvRecordElement, CalendarElement, FaceBubbleElement, FaceElement, FileElement, GiphyElement, GrayTipElement, MarketFaceElement, PicElement, PttElement, RecommendedMsgElement, ReplyElement, ShareLocationElement, StructLongMsgElement, TaskTopMsgElement, TextElement, TofuRecordElement, VideoElement, YoloGameResultElement } from './element';

/*
 * 2024/11/22 Refactor Mlikiowa
 */

/**
 * 表示对等方的信息
 */
export interface Peer {
    chatType: ChatType; // 聊天类型
    peerUid: string;    // 对等方的唯一标识符
    guildId?: string;   // 可选的频道ID
}

/**
 * 表示被踢下线的信息
 */
export interface KickedOffLineInfo {
    appId: number;              // 应用ID
    instanceId: number;         // 实例ID
    sameDevice: boolean;        // 是否为同一设备
    tipsDesc: string;           // 提示描述
    tipsTitle: string;          // 提示标题
    kickedType: number;         // 被踢类型
    securityKickedType: number; // 安全踢出类型
}

/**
 * 获取文件列表的参数
 */
export interface GetFileListParam {
    sortType: number;
    fileCount: number;
    startIndex: number;
    sortOrder: number;
    showOnlinedocFolder: number;
    folderId?: string;
}

/**
 * 消息元素类型枚举
 */
export enum ElementType {
    UNKNOWN = 0,
    TEXT = 1,
    PIC = 2,
    FILE = 3,
    PTT = 4,
    VIDEO = 5,
    FACE = 6,
    REPLY = 7,
    GreyTip = 8, // “小灰条”，包括拍一拍 (Poke)、撤回提示等
    WALLET = 9,
    ARK = 10,
    MFACE = 11,
    LIVEGIFT = 12,
    STRUCTLONGMSG = 13,
    MARKDOWN = 14,
    GIPHY = 15,
    MULTIFORWARD = 16,
    INLINEKEYBOARD = 17,
    INTEXTGIFT = 18,
    CALENDAR = 19,
    YOLOGAMERESULT = 20,
    AVRECORD = 21,
    FEED = 22,
    TOFURECORD = 23,
    ACEBUBBLE = 24,
    ACTIVITY = 25,
    TOFU = 26,
    FACEBUBBLE = 27,
    SHARELOCATION = 28,
    TASKTOPMSG = 29,
    RECOMMENDEDMSG = 43,
    ACTIONBAR = 44
}

/**
 * 消息类型枚举
 */
export enum NTMsgType {
    KMSGTYPEARKSTRUCT = 11,
    KMSGTYPEFACEBUBBLE = 24,
    KMSGTYPEFILE = 3,
    KMSGTYPEGIFT = 14,
    KMSGTYPEGIPHY = 13,
    KMSGTYPEGRAYTIPS = 5,
    KMSGTYPEMIX = 2,
    KMSGTYPEMULTIMSGFORWARD = 8,
    KMSGTYPENULL = 1,
    KMSGTYPEONLINEFILE = 21,
    KMSGTYPEONLINEFOLDER = 27,
    KMSGTYPEPROLOGUE = 29,
    KMSGTYPEPTT = 6,
    KMSGTYPEREPLY = 9,
    KMSGTYPESHARELOCATION = 25,
    KMSGTYPESTRUCT = 4,
    KMSGTYPESTRUCTLONGMSG = 12,
    KMSGTYPETEXTGIFT = 15,
    KMSGTYPEUNKNOWN = 0,
    KMSGTYPEVIDEO = 7,
    KMSGTYPEWALLET = 10
}

/**
 * 图片类型枚举
 */
export enum PicType {
    NEWPIC_APNG = 2001,
    NEWPIC_BMP = 1005,
    NEWPIC_GIF = 2000,
    NEWPIC_JPEG = 1000,
    NEWPIC_PNG = 1001,
    NEWPIC_PROGERSSIV_JPEG = 1003,
    NEWPIC_SHARPP = 1004,
    NEWPIC_WEBP = 1002
}
/**
 * 图片子类型枚举
 */
export enum PicSubType {
    KNORMAL = 0,
    KCUSTOM = 1,
    KHOT = 2,
    KDIPPERCHART = 3,
    KSMART = 4,
    KSPACE = 5,
    KUNKNOW = 6,
    KRELATED = 7
}
/**
 * 消息AT类型枚举
 */
export enum NTMsgAtType {
    ATTYPEALL = 1,
    ATTYPECATEGORY = 512,
    ATTYPECHANNEL = 16,
    ATTYPEME = 4,
    ATTYPEONE = 2,
    ATTYPEONLINE = 64,
    ATTYPEROLE = 8,
    ATTYPESUMMON = 32,
    ATTYPESUMMONONLINE = 128,
    ATTYPESUMMONROLE = 256,
    ATTYPEUNKNOWN = 0
}

/**
 * 消息元素接口
 */
export interface MessageElement {
    elementType: ElementType,
    elementId: string,
    extBufForUI?: string, //"0x",
    textElement?: TextElement;
    faceElement?: FaceElement,
    marketFaceElement?: MarketFaceElement,
    replyElement?: ReplyElement,
    picElement?: PicElement,
    pttElement?: PttElement,
    videoElement?: VideoElement,
    grayTipElement?: GrayTipElement,
    arkElement?: ArkElement,
    fileElement?: FileElement,
    liveGiftElement?: null,
    markdownElement?: MarkdownElement,
    structLongMsgElement?: StructLongMsgElement,
    multiForwardMsgElement?: MultiForwardMsgElement,
    giphyElement?: GiphyElement,
    walletElement?: null,
    inlineKeyboardElement?: InlineKeyboardElement,
    textGiftElement?: null,//????
    calendarElement?: CalendarElement,
    yoloGameResultElement?: YoloGameResultElement,
    avRecordElement?: AvRecordElement,
    structMsgElement?: null,
    faceBubbleElement?: FaceBubbleElement,
    shareLocationElement?: ShareLocationElement,
    tofuRecordElement?: TofuRecordElement,
    taskTopMsgElement?: TaskTopMsgElement,
    recommendedMsgElement?: RecommendedMsgElement,
    actionBarElement?: ActionBarElement
}

/**
 * 消息来源类型枚举
 */
export enum MsgSourceType {
    K_DOWN_SOURCETYPE_AIOINNER = 1,
    K_DOWN_SOURCETYPE_BIGSCREEN = 2,
    K_DOWN_SOURCETYPE_HISTORY = 3,
    K_DOWN_SOURCETYPE_UNKNOWN = 0
}

/**
 * 聊天类型枚举
 */
export enum ChatType {
    KCHATTYPEADELIE = 42,
    KCHATTYPEBUDDYNOTIFY = 5,
    KCHATTYPEC2C = 1,
    KCHATTYPECIRCLE = 113,
    KCHATTYPEDATALINE = 8,
    KCHATTYPEDATALINEMQQ = 134,
    KCHATTYPEDISC = 3,
    KCHATTYPEFAV = 41,
    KCHATTYPEGAMEMESSAGE = 105,
    KCHATTYPEGAMEMESSAGEFOLDER = 116,
    KCHATTYPEGROUP = 2,
    KCHATTYPEGROUPBLESS = 133,
    KCHATTYPEGROUPGUILD = 9,
    KCHATTYPEGROUPHELPER = 7,
    KCHATTYPEGROUPNOTIFY = 6,
    KCHATTYPEGUILD = 4,
    KCHATTYPEGUILDMETA = 16,
    KCHATTYPEMATCHFRIEND = 104,
    KCHATTYPEMATCHFRIENDFOLDER = 109,
    KCHATTYPENEARBY = 106,
    KCHATTYPENEARBYASSISTANT = 107,
    KCHATTYPENEARBYFOLDER = 110,
    KCHATTYPENEARBYHELLOFOLDER = 112,
    KCHATTYPENEARBYINTERACT = 108,
    KCHATTYPEQQNOTIFY = 132,
    KCHATTYPERELATEACCOUNT = 131,
    KCHATTYPESERVICEASSISTANT = 118,
    KCHATTYPESERVICEASSISTANTSUB = 201,
    KCHATTYPESQUAREPUBLIC = 115,
    KCHATTYPESUBSCRIBEFOLDER = 30,
    KCHATTYPETEMPADDRESSBOOK = 111,
    KCHATTYPETEMPBUSSINESSCRM = 102,
    KCHATTYPETEMPC2CFROMGROUP = 100,
    KCHATTYPETEMPC2CFROMUNKNOWN = 99,
    KCHATTYPETEMPFRIENDVERIFY = 101,
    KCHATTYPETEMPNEARBYPRO = 119,
    KCHATTYPETEMPPUBLICACCOUNT = 103,
    KCHATTYPETEMPWPA = 117,
    KCHATTYPEUNKNOWN = 0,
    KCHATTYPEWEIYUN = 40,
}

/**
 * 灰色提示元素子类型枚举
 */
export enum NTGrayTipElementSubTypeV2 {
    GRAYTIP_ELEMENT_SUBTYPE_AIOOP = 15,
    GRAYTIP_ELEMENT_SUBTYPE_BLOCK = 14,
    GRAYTIP_ELEMENT_SUBTYPE_BUDDY = 5,
    GRAYTIP_ELEMENT_SUBTYPE_BUDDYNOTIFY = 9,
    GRAYTIP_ELEMENT_SUBTYPE_EMOJIREPLY = 3,
    GRAYTIP_ELEMENT_SUBTYPE_ESSENCE = 7,
    GRAYTIP_ELEMENT_SUBTYPE_FEED = 6,
    GRAYTIP_ELEMENT_SUBTYPE_FEEDCHANNELMSG = 11,
    GRAYTIP_ELEMENT_SUBTYPE_FILE = 10,
    GRAYTIP_ELEMENT_SUBTYPE_GROUP = 4,
    GRAYTIP_ELEMENT_SUBTYPE_GROUPNOTIFY = 8,
    GRAYTIP_ELEMENT_SUBTYPE_JSON = 17,
    GRAYTIP_ELEMENT_SUBTYPE_LOCALMSG = 13,
    GRAYTIP_ELEMENT_SUBTYPE_PROCLAMATION = 2,
    GRAYTIP_ELEMENT_SUBTYPE_REVOKE = 1,
    GRAYTIP_ELEMENT_SUBTYPE_UNKNOWN = 0,
    GRAYTIP_ELEMENT_SUBTYPE_WALLET = 16,
    GRAYTIP_ELEMENT_SUBTYPE_XMLMSG = 12,
}

/**
 * Poke 类型枚举
 */
export enum PokeType {
    POKE_TYPE_APPROVE = 3,
    POKE_TYPE_GIVING_HEART = 2,
    POKE_TYPE_GREAT_MOVE = 6,
    POKE_TYPE_HEART_BREAK = 4,
    POKE_TYPE_HI_TOGETHER = 5,
    POKE_TYPE_POKE = 1,
    POKE_TYPE_POKE_OLD = 0,
    POKE_TYPE_VAS_POKE = 126,
}

/**
 * 表情索引枚举
 */
export enum FaceIndex {
    DICE = 358,
    RPS = 359
}

/**
 * 视频类型枚举
 */
export enum NTVideoType {
    VIDEO_FORMAT_AFS = 7,
    VIDEO_FORMAT_AVI = 1,
    VIDEO_FORMAT_MKV = 4,
    VIDEO_FORMAT_MOD = 9,
    VIDEO_FORMAT_MOV = 8,
    VIDEO_FORMAT_MP4 = 2,
    VIDEO_FORMAT_MTS = 11,
    VIDEO_FORMAT_RM = 6,
    VIDEO_FORMAT_RMVB = 5,
    VIDEO_FORMAT_TS = 10,
    VIDEO_FORMAT_WMV = 3,
}

/**
 * Markdown元素接口
 */
export interface MarkdownElement {
    content: string;
}

/**
 * 内联键盘按钮接口
 */
export interface InlineKeyboardElementRowButton {
    id: string;
    label: string;
    visitedLabel: string;
    style: 1; // 未知
    type: 2; // 未知
    clickLimit: 0;  // 未知
    unsupportTips: string;
    data: string;
    atBotShowChannelList: boolean;
    permissionType: number;
    specifyRoleIds: [];
    specifyTinyids: [];
    isReply: false;
    anchor: 0;
    enter: false;
    subscribeDataTemplateIds: [];
}

/**
 * 内联键盘元素接口
 */
export interface InlineKeyboardElement {
    rows: [{
        buttons: InlineKeyboardElementRowButton[]
    }],
    botAppid: string;
}

/**
 * Aio操作灰色提示元素接口
 */
export interface TipAioOpGrayTipElement {
    operateType: number;
    peerUid: string;
    fromGrpCodeOfTmpChat: string;
}

/**
 * 群提示元素类型枚举
 */
export enum TipGroupElementType {
    KUNKNOWN = 0,
    KMEMBERADD = 1,
    KDISBANDED = 2,
    KQUITTE = 3,
    KCREATED = 4,
    KGROUPNAMEMODIFIED = 5,
    KBLOCK = 6,
    KUNBLOCK = 7,
    KSHUTUP = 8,
    KBERECYCLED = 9,
    KDISBANDORBERECYCLED = 10
}

/**
 * 群加入ShowType
 */
export enum MemberAddShowType {
    K_OTHER_ADD = 0,
    K_OTHER_ADD_BY_OTHER_QRCODE = 2,
    K_OTHER_ADD_BY_YOUR_QRCODE = 3,
    K_OTHER_INVITE_OTHER = 5,
    K_OTHER_INVITE_YOU = 6,
    K_YOU_ADD = 1,
    K_YOU_ADD_BY_OTHER_QRCODE = 4,
    K_YOU_ALREADY_MEMBER = 8,
    K_YOU_INVITE_OTHER = 7,
}

/**
 * 群提示元素成员角色枚举
 */
export enum NTGroupGrayElementRole {
    KOTHER = 0,
    KMEMBER = 1,
    KADMIN = 2
}

/**
 * 群灰色提示成员接口
 * */

export interface NTGroupGrayMember {
    serialVersionUID: string;
    uid: string;
    name: string;
}
/**
 * 群灰色提示邀请者和被邀请者接口
 *
 * */
export interface NTGroupGrayInviterAndInvite {
    invited: NTGroupGrayMember;
    inviter: NTGroupGrayMember;
    serialVersionUID: string;
}
/**
 * 群提示元素接口
 */
export interface TipGroupElement {
    type: TipGroupElementType;
    role: NTGroupGrayElementRole;
    groupName: string;
    memberUid: string;
    memberNick: string;
    memberRemark: string;
    adminUid: string;
    adminNick: string;
    adminRemark: string;
    createGroup: null;
    memberAdd?: {
        showType: MemberAddShowType;
        otherAdd: NTGroupGrayMember;
        otherAddByOtherQRCode: NTGroupGrayInviterAndInvite;
        otherAddByYourQRCode: NTGroupGrayMember;
        youAddByOtherQRCode: NTGroupGrayMember;
        otherInviteOther: NTGroupGrayInviterAndInvite;
        otherInviteYou: NTGroupGrayMember;
        youInviteOther: NTGroupGrayMember;
    };
    shutUp?: {
        curTime: string;
        duration: string;  // 禁言时间，秒
        admin: {
            uid: string;
            card: string;
            name: string;
            role: NTGroupMemberRole
        };
        member: {
            uid: string
            card: string;
            name: string;
            role: NTGroupMemberRole
        }
    };
}

/**
 * 多条转发消息元素接口
 */
export interface MultiForwardMsgElement {
    xmlContent: string;  // xml格式的消息内容
    resId: string;
    fileName: string;
}

/**
 * 发送状态类型枚举
 */
export enum SendStatusType {
    KSEND_STATUS_FAILED = 0,
    KSEND_STATUS_SENDING = 1,
    KSEND_STATUS_SUCCESS = 2,
    KSEND_STATUS_SUCCESS_NOSEQ = 3
}

/**
 * 原始消息接口
 */
export interface RawMessage {
    parentMsgPeer: Peer; // 父消息的Peer
    parentMsgIdList: string[];// 父消息 ID 列表
    id?: number;// 扩展字段，与 Ob11 msg ID 有关
    guildId: string;// 频道ID
    msgRandom: string;// 消息ID相关
    msgId: string;// 雪花ID
    msgTime: string;// 消息时间戳
    msgSeq: string;// 消息序列号
    msgType: NTMsgType;// 消息类型
    subMsgType: number;// 子消息类型
    senderUid: string;// 发送者 UID
    senderUin: string;// 发送者 QQ 号
    peerUid: string;// 群号 / 用户 UID
    peerUin: string;// 群号 / 用户 QQ 号
    remark?: string;// 备注
    peerName: string;// Peer名称
    sendNickName: string;// 发送者昵称
    sendRemarkName: string;// 发送者好友备注
    sendMemberName?: string;// 发送者群名片（如果是群消息）
    chatType: ChatType;// 会话类型
    sendStatus?: SendStatusType;// 消息状态
    recallTime: string;// 撤回时间，"0" 是没有撤回
    records: RawMessage[];// 消息记录
    elements: MessageElement[];// 消息元素
    sourceType: MsgSourceType;// 消息来源类型
    isOnlineMsg: boolean;// 是否为在线消息
    clientSeq?: string;
}

/**
 * 查询消息参数接口
 */
export interface QueryMsgsParams {
    chatInfo: Peer & { privilegeFlag?: number };
    //searchFields: number;
    filterMsgType: Array<{ type: NTMsgType, subType: Array<number> }>;
    filterSendersUid: string[];
    filterMsgFromTime: string;
    filterMsgToTime: string;
    pageLimit: number;
    isReverseOrder: boolean;
    isIncludeCurrent: boolean;
}

/**
 * 临时聊天信息API接口
 */
export interface TmpChatInfoApi {
    errMsg: string;
    result: number;
    tmpChatInfo?: TmpChatInfo;
}

/**
 * 临时聊天信息接口
 */
export interface TmpChatInfo {
    chatType: number;
    fromNick: string;
    groupCode: string;
    peerUid: string;
    sessionType: number;
    sig: string;
}

/**
 * 消息请求类型接口
 */
export interface MsgReqType {
    peer: Peer,
    byType: number,
    msgId: string,
    msgSeq: string,
    msgTime: string,
    clientSeq: string,
    cnt: number,
    queryOrder: boolean,
    includeSelf: boolean,
    includeDeleteMsg: boolean,
    extraCnt: number
}

/**
 * 表情类型枚举
 */
export enum FaceType {
    Unknown = 0,
    OldFace = 1, // 老表情
    Normal = 2, // 常规表情
    AniSticke = 3,  // 动画贴纸
    Lottie = 4,// 新格式表情
    Poke = 5  // 可变Poke
}
