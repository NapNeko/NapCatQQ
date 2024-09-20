import { GroupMemberRole } from '@/core';

export interface Peer {
    chatType: ChatType;
    peerUid: string;  // 如果是群聊uid为群号，私聊uid就是加密的字符串
    guildId?: string;
}

export interface KickedOffLineInfo {
    appId: number;
    instanceId: number;
    sameDevice: boolean;
    tipsDesc: string;
    tipsTitle: string;
    kickedType: number;
    securityKickedType: number;
}

export interface GetFileListParam {
    sortType: number;
    fileCount: number;
    startIndex: number;
    sortOrder: number;
    showOnlinedocFolder: number;
    folderId?: string;
}

export enum ElementType {
    UNKNOWN = 0,

    TEXT = 1,

    PIC = 2,

    FILE = 3,

    PTT = 4,

    VIDEO = 5,

    FACE = 6,

    REPLY = 7,

    WALLET = 9,

    /**
     * “小灰条”，包括拍一拍 (Poke)、撤回提示等
     */
    GreyTip = 8,

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

export interface ActionBarElement {
    rows: InlineKeyboardRow[];
    botAppid: string;
}

export interface SendActionBarElement {
    elementType: ElementType.ACTIONBAR;
    elementId: string;
    actionBarElement: ActionBarElement;
}

export interface RecommendedMsgElement {
    rows: InlineKeyboardRow[];
    botAppid: string;
}

export interface SendRecommendedMsgElement {
    elementType: ElementType.RECOMMENDEDMSG;
    elementId: string;
    recommendedMsgElement: RecommendedMsgElement;
}

export interface InlineKeyboardButton {
    id: string;
    label: string;
    visitedLabel: string;
    unsupportTips: string;
    data: string;
    specifyRoleIds: string[];
    specifyTinyids: string[];
    style: number;
    type: number;
    clickLimit: number;
    atBotShowChannelList: boolean;
    permissionType: number;
}

export interface InlineKeyboardRow {
    buttons: InlineKeyboardButton[];
}

export interface TofuElementContent {
    color: string;
    tittle: string;
}

export interface TaskTopMsgElement {
    msgTitle: string;
    msgSummary: string;
    iconUrl: string;
    topMsgType: number;
}

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

export interface SendTaskTopMsgElement {
    elementType: ElementType.TASKTOPMSG;
    elementId: string;
    taskTopMsgElement: TaskTopMsgElement;
}

export interface TofuRecordElement {
    type: number;
    busiid: string;
    busiuuid: string;
    descriptionContent: string;
    contentlist: TofuElementContent[],
    background: string;
    icon: string;
    uinlist: string[],
    uidlist: string[],
    busiExtra: string;
    updateTime: string;
    dependedmsgid: string;
    msgtime: string;
    onscreennotify: boolean;
}

export interface SendTofuRecordElement {
    elementType: ElementType.TOFURECORD;
    elementId: string;
    tofuRecordElement: TofuRecordElement;
}

export interface FaceBubbleElement {
    faceCount: number;
    faceSummary: string;
    faceFlag: number;
    content: string;
    oldVersionStr: string;
    faceType: number;
    others: string;
    yellowFaceInfo: {
        index: number;
        buf: string;
        compatibleText: string;
        text: string;
    };
}

export interface SendFaceBubbleElement {
    elementType: ElementType.FACEBUBBLE;
    elementId: string;
    faceBubbleElement: FaceBubbleElement;

}

export interface AvRecordElement {
    type: number;
    time: string;
    text: string;
    mainType: number;
    hasRead: boolean;
    extraType: number;
}

export interface SendavRecordElement {
    elementType: ElementType.AVRECORD;
    elementId: string;
    avRecordElement: AvRecordElement;
}

export interface YoloUserInfo {
    uid: string;
    result: number;
    rank: number;
    bizId: string;
}

export interface SendInlineKeyboardElement {
    elementType: ElementType.INLINEKEYBOARD;
    elementId: string;
    inlineKeyboardElement: {
        rows: number;
        botAppid: string;
    };

}

export interface YoloGameResultElement {
    UserInfo: YoloUserInfo[];
}

export interface SendYoloGameResultElement {
    elementType: ElementType.YOLOGAMERESULT;
    yoloGameResultElement: YoloGameResultElement;
}

export interface GiphyElement {
    id: string;
    isClip: boolean;
    width: number;
    height: number;
}

export interface SendGiphyElement {
    elementType: ElementType.GIPHY;
    elementId: string;
    giphyElement: GiphyElement;
}

export interface SendWalletElement {
    elementType: ElementType.UNKNOWN;//不做 设置位置
    elementId: string;
    walletElement: Record<string, never>;
}

export interface CalendarElement {
    summary: string;
    msg: string;
    expireTimeMs: string;
    schemaType: number;
    schema: string;
}

export interface SendCalendarElement {
    elementType: ElementType.CALENDAR;
    elementId: string;
    calendarElement: CalendarElement;
}

export interface SendliveGiftElement {
    elementType: ElementType.LIVEGIFT;
    elementId: string;
    liveGiftElement: Record<string, never>;
}

export interface SendTextElement {
    elementType: ElementType.TEXT;
    elementId: string;
    textElement: {
        content: string;
        atType: number;
        atUid: string;
        atTinyId: string;
        atNtUid: string;
    };
}

export interface SendPttElement {
    elementType: ElementType.PTT;
    elementId: string;
    pttElement: {
        fileName: string;
        filePath: string;
        md5HexStr: string;
        fileSize: number;
        duration: number;  // 单位是秒
        formatType: number;
        voiceType: number;
        voiceChangeType: number;
        canConvert2Text: boolean;
        waveAmplitudes: number[];
        fileSubId: string;
        playState: number;
        autoConvertText: number;
    };
}

export enum PicType {
    gif = 2000,
    jpg = 1000
}

export enum PicSubType {
    normal = 0, // 普通图片，大图
    face = 1  // 表情包小图
}

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

export interface SendPicElement {
    elementType: ElementType.PIC;
    elementId: string;
    picElement: PicElement;
}

export interface ReplyElement {
    sourceMsgIdInRecords?: string;
    replayMsgSeq: string;
    replayMsgId: string;
    senderUin: string;
    senderUidStr?: string;
    replyMsgTime?: string;
}

export interface SendReplyElement {
    elementType: ElementType.REPLY;
    elementId: string;
    replyElement: ReplyElement;
}

export interface SendFaceElement {
    elementType: ElementType.FACE;
    elementId: string;
    faceElement: FaceElement;
}

export interface SendMarketFaceElement {
    elementType: ElementType.MFACE;
    marketFaceElement: MarketFaceElement;
}

export interface SendstructLongMsgElement {
    elementType: ElementType.STRUCTLONGMSG;
    elementId: string;
    structLongMsgElement: StructLongMsgElement;
}

export interface StructLongMsgElement {
    xmlContent: string;
    resId: string;
}

export interface SendactionBarElement {
    elementType: ElementType.ACTIONBAR;
    elementId: string;
    actionBarElement: {
        rows: number;
        botAppid: string;
    };
}

export interface ShareLocationElement {
    text: string;
    ext: string;
}

export interface SendShareLocationElement {
    elementType: ElementType.SHARELOCATION;
    elementId: string;
    shareLocationElement?: ShareLocationElement;
}

export interface FileElement {
    fileMd5?: string;
    fileName: string;
    filePath: string;
    fileSize: string;
    picHeight?: number;
    picWidth?: number;
    folderId?: string;
    picThumbPath?: Map<number, string>;
    file10MMd5?: string;
    fileSha?: string;
    fileSha3?: string;
    fileUuid?: string;
    fileSubId?: string;
    thumbFileSize?: number;
    fileBizId?: number;
}

export interface SendFileElement {
    elementType: ElementType.FILE;
    elementId: string;
    fileElement: FileElement;
}

export interface SendVideoElement {
    elementType: ElementType.VIDEO;
    elementId: string;
    videoElement: VideoElement;
}

export interface SendArkElement {
    elementType: ElementType.ARK;
    elementId: string;
    arkElement: ArkElement;
}

export interface SendMarkdownElement {
    elementType: ElementType.MARKDOWN;
    elementId: string;
    markdownElement: MarkdownElement;
}

export type SendMessageElement = SendTextElement | SendPttElement |
    SendPicElement | SendReplyElement | SendFaceElement | SendMarketFaceElement | SendFileElement |
    SendVideoElement | SendArkElement | SendMarkdownElement | SendShareLocationElement;

export interface TextElement {
    content: string;
    atType: number;
    atUid: string;
    atTinyId: string;
    atNtUid: string;
}

export interface MessageElement {
    elementType: ElementType,
    elementId: string,
    extBufForUI: string,//"0x",
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

export enum AtType {
    notAt = 0,
    atAll = 1,
    atUser = 2
}

// 来自Android分析
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

export interface PttElement {
    canConvert2Text: boolean;
    duration: number; // 秒数
    fileBizId: null;
    fileId: number; // 0
    fileName: string; // "e4d09c784d5a2abcb2f9980bdc7acfe6.amr"
    filePath: string; // "/Users//Library/Containers/com.tencent.qq/Data/Library/Application Support/QQ/nt_qq_a6b15c9820595d25a56c1633ce19ad40/nt_data/Ptt/2023-11/Ori/e4d09c784d5a2abcb2f9980bdc7acfe6.amr"
    fileSize: string; // "4261"
    fileSubId: string; // "0"
    fileUuid: string; // "90j3z7rmRphDPrdVgP9udFBaYar#oK0TWZIV"
    formatType: string; // 1
    invalidState: number; // 0
    md5HexStr: string; // "e4d09c784d5a2abcb2f9980bdc7acfe6"
    playState: number; // 0
    progress: number; // 0
    text: string; // ""
    transferStatus: number; // 0
    translateStatus: number; // 0
    voiceChangeType: number; // 0
    voiceType: number; // 0
    waveAmplitudes: number[];
}

export interface ArkElement {
    bytesData: string;
    linkInfo: null;
    subElementType: null;
}

export const IMAGE_HTTP_HOST = 'https://gchat.qpic.cn';
export const IMAGE_HTTP_HOST_NT = 'https://multimedia.nt.qq.com.cn';

export interface PicElement {
    md5HexStr?: string;
    filePath?: string;
    fileSize: number | string;//number
    picWidth: number;
    picHeight: number;
    fileName: string;
    sourcePath: string;
    original: boolean;
    picType: PicType;
    picSubType?: PicSubType;
    fileUuid: string;
    fileSubId: string;
    thumbFileSize: number;
    summary: string;
    thumbPath: Map<number, string>;
    originImageMd5?: string;
    originImageUrl?: string;  // http url, 没有host，host是https://gchat.qpic.cn/, 带download参数的是https://multimedia.nt.qq.com.cn
}

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

export interface GrayTipElement {
    subElementType: NTGrayTipElementSubTypeV2;
    revokeElement: {
        operatorRole: string;
        operatorUid: string;
        operatorNick: string;
        operatorRemark: string;
        operatorMemRemark?: string;
        wording: string;  // 自定义的撤回提示语
    };
    aioOpGrayTipElement: TipAioOpGrayTipElement;
    groupElement: TipGroupElement;
    xmlElement: {
        content: string;
        templId: string;
    };
    jsonGrayTipElement: {
        busiId?: number;
        jsonStr: string;
    };
}

export enum FaceType {
    normal = 1, // 小黄脸
    normal2 = 2, // 新小黄脸, 从faceIndex 222开始？
    dice = 3  // 骰子
}

export enum FaceIndex {
    dice = 358,
    RPS = 359  // 石头剪刀布
}

export interface FaceElement {
    faceIndex: number;
    faceType: FaceType;
    faceText?: string;
    packId?: string;
    stickerId?: string;
    sourceType?: number;
    stickerType?: number;
    resultId?: string;
    surpriseId?: string;
    randomType?: number;
}

export interface MarketFaceElement {
    emojiPackageId: number;
    faceName: string;
    emojiId: string;
    key: string;
}

export interface VideoElement {
    filePath: string;
    fileName: string;
    videoMd5?: string;
    thumbMd5?: string;
    fileTime?: number; // second
    thumbSize?: number; // byte
    fileFormat?: viedo_type;  // 2表示mp4 参考下面条目
    fileSize?: string;  // byte
    thumbWidth?: number;
    thumbHeight?: number;
    busiType?: 0; //
    subBusiType?: 0; // 未知
    thumbPath?: Map<number, any>;
    transferStatus?: 0; // 未知
    progress?: 0;  // 下载进度？
    invalidState?: 0; // 未知
    fileUuid?: string;  // 可以用于下载链接？
    fileSubId?: string;
    fileBizId?: null;
    originVideoMd5?: string;
    import_rich_media_context?: null;
    sourceVideoCodecFormat?: number;
}

// export enum busiType{
//   public static final int CREATOR_SHARE_ADV_XWORLD = 21;
//   public static final int MINI_APP_MINI_GAME = 11;
//   public static final int OFFICIAL_ACCOUNT_ADV = 4;
//   public static final int OFFICIAL_ACCOUNT_ADV_GAME = 8;
//   public static final int OFFICIAL_ACCOUNT_ADV_SHOP = 9;
//   public static final int OFFICIAL_ACCOUNT_ADV_VIP = 7;
//   public static final int OFFICIAL_ACCOUNT_LAYER_MASK_ADV = 14;
//   public static final int OFFICIAL_ACCOUNT_SPORT = 13;
//   public static final int OFFICIAL_ACCOUNT_TIAN_QI = 10;
//   public static final int PC_QQTAB_ADV = 18;
//   public static final int QIQIAOBAN_SDK = 15;
//   public static final int QQ_CPS = 16;
//   public static final int QQ_WALLET_CPS = 17;
//   public static final int QZONE_FEEDS = 0;
//   public static final int QZONE_PHOTO_TAIL = 2;
//   public static final int QZONE_VIDEO_LAYER = 1;
//   public static final int REWARD_GIFT_ADV = 6;
//   public static final int REWARD_GROUPGIFT_ADV = 12;
//   public static final int REWARD_PERSONAL_ADV = 5;
//   public static final int WEISEE_OFFICIAL_ACCOUNT = 3;
//   public static final int X_WORLD_CREATOR_ADV = 20;
//   public static final int X_WORLD_QZONE_LAYER = 22;
//   public static final int X_WORLD_VIDEO_ADV = 19;

// }
// export enum CategoryBusiType {
//   _KCateBusiTypeDefault = 0,
//   _kCateBusiTypeFaceCluster = 1,
//   _kCateBusiTypeLabelCluster = 4,
//   _kCateBusiTypeMonthCluster = 16,
//   _kCateBusiTypePoiCluster = 2,
//   _kCateBusiTypeYearCluster = 8,
// }
export enum viedo_type {
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

export interface MarkdownElement {
    content: string;
}

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

export interface InlineKeyboardElement {
    rows: [{
        buttons: InlineKeyboardElementRowButton[]
    }];
}

export interface TipAioOpGrayTipElement {  // 这是什么提示来着？
    operateType: number;
    peerUid: string;
    fromGrpCodeOfTmpChat: string;
}

export enum TipGroupElementType {
    memberIncrease = 1,
    kicked = 3, // 被移出群
    ban = 8
}

// public final class MemberAddShowType {
//   public static final int KOTHERADD = 0;
//   public static final int KOTHERADDBYOTHERQRCODE = 2;
//   public static final int KOTHERADDBYYOURQRCODE = 3;
//   public static final int KOTHERINVITEOTHER = 5;
//   public static final int KOTHERINVITEYOU = 6;
//   public static final int KYOUADD = 1;
//   public static final int KYOUADDBYOTHERQRCODE = 4;
//   public static final int KYOUALREADYMEMBER = 8;
//   public static final int KYOUINVITEOTHER = 7;
// }
export interface TipGroupElement {
    type: TipGroupElementType;  // 1是表示有人加入群; 自己加入群也会收到这个
    role: 0;  // 暂时不知
    groupName: string;  // 暂时获取不到
    memberUid: string;
    memberNick: string;
    memberRemark: string;
    adminUid: string;
    adminNick: string;
    adminRemark: string;
    createGroup: null;
    memberAdd?: {
        showType: 1;
        otherAdd: null;
        otherAddByOtherQRCode: null;
        otherAddByYourQRCode: null;
        youAddByOtherQRCode: null;
        otherInviteOther: null;
        otherInviteYou: null;
        youInviteOther: null
    };
    shutUp?: {
        curTime: string;
        duration: string;  // 禁言时间，秒
        admin: {
            uid: string;
            card: string;
            name: string;
            role: GroupMemberRole
        };
        member: {
            uid: string
            card: string;
            name: string;
            role: GroupMemberRole
        }
    };
}

export interface MultiForwardMsgElement {
    xmlContent: string;  // xml格式的消息内容
    resId: string;
    fileName: string;
}

export enum SendStatusType {
    KSEND_STATUS_FAILED = 0,
    KSEND_STATUS_SENDING = 1,
    KSEND_STATUS_SUCCESS = 2,
    KSEND_STATUS_SUCCESS_NOSEQ = 3
}

export interface RawMessage {
    parentMsgPeer: Peer;

    parentMsgIdList: string[];

    /**
     * 扩展字段，与 Ob11 msg ID 有关
     */
    id?: number;

    guildId: string;

    msgRandom: string;

    msgId: string;

    /**
     * 消息时间戳（秒）
     */
    msgTime: string;

    msgSeq: string;

    msgType: NTMsgType;

    subMsgType: number;

    senderUid: string;

    /**
     * 发送者 QQ 号
     */
    senderUin: string;

    /**
     * 群号 / 用户 UID
     */
    peerUid: string;

    /**
     * 群号 / 用户 QQ 号
     */
    peerUin: string;

    /**
     * 发送者昵称（如果是好友消息）
     */
    sendNickName: string;

    /**
     * 发送者群名片（如果是群消息）
     */
    sendMemberName?: string;

    chatType: ChatType;

    /**
     * 消息状态，别人发的 2 是已撤回，自己发的 2 是已发送
     */
    sendStatus?: SendStatusType;

    /**
     * 撤回时间，"0" 是没有撤回
     */
    recallTime: string;

    records: RawMessage[];

    elements: MessageElement[];
}
export interface QueryMsgsParams {
    chatInfo: Peer;
    filterMsgType: [];
    filterSendersUid: string[];
    filterMsgFromTime: string;
    filterMsgToTime: string;
    pageLimit: number;
    isReverseOrder: boolean;
    isIncludeCurrent: boolean;
}

export interface TmpChatInfoApi {
    errMsg: string;
    result: number;
    tmpChatInfo?: TmpChatInfo;
}

export interface TmpChatInfo {
    chatType: number;
    fromNick: string;
    groupCode: string;
    peerUid: string;
    sessionType: number;
    sig: string;
}
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
//getMsgsIncludeSelf Peer必须 byType 1
//getMsgsWithMsgTimeAndClientSeqForC2C Peer必须 byType 3