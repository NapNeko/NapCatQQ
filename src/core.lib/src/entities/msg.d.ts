import { GroupMemberRole } from './group';
export interface Peer {
    chatType: ChatType;
    peerUid: string;
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
}
export declare enum ElementType {
    TEXT = 1,
    PIC = 2,
    FILE = 3,
    PTT = 4,
    VIDEO = 5,
    FACE = 6,
    REPLY = 7,
    ARK = 10,
    MFACE = 11,
    MARKDOWN = 14
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
        duration: number;
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
export declare enum PicType {
    gif = 2000,
    jpg = 1000
}
export declare enum PicSubType {
    normal = 0,// 普通图片，大图
    face = 1
}
export interface SendPicElement {
    elementType: ElementType.PIC;
    elementId: string;
    picElement: {
        md5HexStr: string;
        fileSize: number | string;
        picWidth: number;
        picHeight: number;
        fileName: string;
        sourcePath: string;
        original: boolean;
        picType: PicType;
        picSubType: PicSubType;
        fileUuid: string;
        fileSubId: string;
        thumbFileSize: number;
        summary: string;
    };
}
export interface SendReplyElement {
    elementType: ElementType.REPLY;
    elementId: string;
    replyElement: {
        replayMsgSeq: string;
        replayMsgId: string;
        senderUin: string;
        senderUinStr: string;
    };
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
export type SendMessageElement = SendTextElement | SendPttElement | SendPicElement | SendReplyElement | SendFaceElement | SendMarketFaceElement | SendFileElement | SendVideoElement | SendArkElement | SendMarkdownElement;
export declare enum AtType {
    notAt = 0,
    atAll = 1,
    atUser = 2
}
export declare enum ChatType {
    friend = 1,
    group = 2,
    chatDevice = 8,//移动设备?
    temp = 100
}
export declare enum ChatType2 {
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
    KCHATTYPEWEIYUN = 40
}
export interface PttElement {
    canConvert2Text: boolean;
    duration: number;
    fileBizId: null;
    fileId: number;
    fileName: string;
    filePath: string;
    fileSize: string;
    fileSubId: string;
    fileUuid: string;
    formatType: string;
    invalidState: number;
    md5HexStr: string;
    playState: number;
    progress: number;
    text: string;
    transferStatus: number;
    translateStatus: number;
    voiceChangeType: number;
    voiceType: number;
    waveAmplitudes: number[];
}
export interface ArkElement {
    bytesData: string;
    linkInfo: null;
    subElementType: null;
}
export declare const IMAGE_HTTP_HOST = "https://gchat.qpic.cn";
export declare const IMAGE_HTTP_HOST_NT = "https://multimedia.nt.qq.com.cn";
export interface PicElement {
    originImageUrl: string;
    originImageMd5?: string;
    sourcePath: string;
    thumbPath: Map<number, string>;
    picWidth: number;
    picHeight: number;
    fileSize: number;
    fileName: string;
    fileUuid: string;
    md5HexStr?: string;
}
export declare enum GrayTipElementSubType {
    INVITE_NEW_MEMBER = 12,
    MEMBER_NEW_TITLE = 17
}
export interface GrayTipElement {
    subElementType: GrayTipElementSubType;
    revokeElement: {
        operatorRole: string;
        operatorUid: string;
        operatorNick: string;
        operatorRemark: string;
        operatorMemRemark?: string;
        wording: string;
    };
    aioOpGrayTipElement: TipAioOpGrayTipElement;
    groupElement: TipGroupElement;
    xmlElement: {
        content: string;
        templId: string;
    };
    jsonGrayTipElement: {
        jsonStr: string;
    };
}
export declare enum FaceType {
    normal = 1,// 小黄脸
    normal2 = 2,// 新小黄脸, 从faceIndex 222开始？
    dice = 3
}
export declare enum FaceIndex {
    dice = 358,
    RPS = 359
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
    fileTime?: number;
    thumbSize?: number;
    fileFormat?: number;
    fileSize?: string;
    thumbWidth?: number;
    thumbHeight?: number;
    busiType?: 0;
    subBusiType?: 0;
    thumbPath?: Map<number, any>;
    transferStatus?: 0;
    progress?: 0;
    invalidState?: 0;
    fileUuid?: string;
    fileSubId?: string;
    fileBizId?: null;
    originVideoMd5?: string;
    import_rich_media_context?: null;
    sourceVideoCodecFormat?: number;
}
export declare enum viedo_type {
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
    VIDEO_FORMAT_WMV = 3
}
export interface MarkdownElement {
    content: string;
}
export interface InlineKeyboardElementRowButton {
    id: string;
    label: string;
    visitedLabel: string;
    style: 1;
    type: 2;
    clickLimit: 0;
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
    rows: [
        {
            buttons: InlineKeyboardElementRowButton[];
        }
    ];
}
export interface TipAioOpGrayTipElement {
    operateType: number;
    peerUid: string;
    fromGrpCodeOfTmpChat: string;
}
export declare enum TipGroupElementType {
    memberIncrease = 1,
    kicked = 3,// 被移出群
    ban = 8
}
export interface TipGroupElement {
    type: TipGroupElementType;
    role: 0;
    groupName: string;
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
        youInviteOther: null;
    };
    shutUp?: {
        curTime: string;
        duration: string;
        admin: {
            uid: string;
            card: string;
            name: string;
            role: GroupMemberRole;
        };
        member: {
            uid: string;
            card: string;
            name: string;
            role: GroupMemberRole;
        };
    };
}
export interface MultiForwardMsgElement {
    xmlContent: string;
    resId: string;
    fileName: string;
}
export interface RawMessage {
    id?: number;
    msgId: string;
    msgTime: string;
    msgSeq: string;
    msgType: number;
    subMsgType: number;
    senderUid: string;
    senderUin: string;
    peerUid: string;
    peerUin: string;
    sendNickName: string;
    sendMemberName?: string;
    chatType: ChatType;
    sendStatus?: number;
    recallTime: string;
    elements: {
        elementId: string;
        elementType: ElementType;
        replyElement: {
            senderUid: string;
            sourceMsgIsIncPic: boolean;
            sourceMsgText: string;
            replayMsgSeq: string;
        };
        textElement: {
            atType: AtType;
            atUid: string;
            content: string;
            atNtUid: string;
        };
        picElement: PicElement;
        pttElement: PttElement;
        arkElement: ArkElement;
        grayTipElement: GrayTipElement;
        faceElement: FaceElement;
        videoElement: VideoElement;
        fileElement: FileElement;
        marketFaceElement: MarketFaceElement;
        inlineKeyboardElement: InlineKeyboardElement;
        markdownElement: MarkdownElement;
        multiForwardMsgElement: MultiForwardMsgElement;
    }[];
}
