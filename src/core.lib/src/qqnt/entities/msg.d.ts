import { GroupMemberRole } from './group';
export interface Peer {
    chatType: ChatType;
    peerUid: string;
    guildId?: '';
}
export declare enum ElementType {
    TEXT = 1,
    PIC = 2,
    FILE = 3,
    PTT = 4,
    VIDEO = 5,
    FACE = 6,
    REPLY = 7,
    ARK = 10
}
export interface SendTextElement {
    elementType: ElementType.TEXT;
    elementId: '';
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
    elementId: '';
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
        fileSubId: '';
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
    elementId: '';
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
    elementId: '';
    replyElement: {
        replayMsgSeq: string;
        replayMsgId: string;
        senderUin: string;
        senderUinStr: string;
    };
}
export interface SendFaceElement {
    elementType: ElementType.FACE;
    elementId: '';
    faceElement: FaceElement;
}
export interface FileElement {
    'fileMd5'?: '';
    'fileName': string;
    'filePath': string;
    fileSize: string;
    'picHeight'?: number;
    'picWidth'?: number;
    'picThumbPath'?: Map<number, string>;
    'file10MMd5'?: '';
    'fileSha'?: '';
    'fileSha3'?: '';
    'fileUuid'?: '';
    'fileSubId'?: '';
    'thumbFileSize'?: number;
    fileBizId?: number;
}
export interface SendFileElement {
    elementType: ElementType.FILE;
    elementId: '';
    fileElement: FileElement;
}
export interface SendVideoElement {
    elementType: ElementType.VIDEO;
    elementId: '';
    videoElement: VideoElement;
}
export interface SendArkElement {
    elementType: ElementType.ARK;
    elementId: '';
    arkElement: ArkElement;
}
export type SendMessageElement = SendTextElement | SendPttElement | SendPicElement | SendReplyElement | SendFaceElement | SendFileElement | SendVideoElement | SendArkElement;
export declare enum AtType {
    notAt = 0,
    atAll = 1,
    atUser = 2
}
export declare enum ChatType {
    friend = 1,
    group = 2,
    temp = 100
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
    };
    jsonGrayTipElement: {
        jsonStr: string;
    };
}
export interface FaceElement {
    faceIndex: number;
    faceType: 1;
}
export interface MarketFaceElement {
    'itemType': 6;
    'faceInfo': 1;
    'emojiPackageId': 203875;
    'subType': 3;
    'mediaType': 0;
    'imageWidth': 200;
    'imageHeight': 200;
    'faceName': string;
    'emojiId': '094d53bd1c9ac5d35d04b08e8a6c992c';
    'key': 'a8b1dd0aebc8d910';
    'param': null;
    'mobileParam': null;
    'sourceType': null;
    'startTime': null;
    'endTime': null;
    'emojiType': 1;
    'hasIpProduct': null;
    'voiceItemHeightArr': null;
    'sourceName': null;
    'sourceJumpUrl': null;
    'sourceTypeName': null;
    'backColor': null;
    'volumeColor': null;
    'staticFacePath': 'E:\\SystemDocuments\\QQ\\721011692\\nt_qq\\nt_data\\Emoji\\marketface\\203875\\094d53bd1c9ac5d35d04b08e8a6c992c_aio.png';
    'dynamicFacePath': 'E:\\SystemDocuments\\QQ\\721011692\\nt_qq\\nt_data\\Emoji\\marketface\\203875\\094d53bd1c9ac5d35d04b08e8a6c992c';
    'supportSize': [
        {
            'width': 300;
            'height': 300;
        },
        {
            'width': 200;
            'height': 200;
        }
    ];
    'apngSupportSize': null;
}
export interface VideoElement {
    'filePath': string;
    'fileName': string;
    'videoMd5'?: string;
    'thumbMd5'?: string;
    'fileTime'?: number;
    'thumbSize'?: number;
    'fileFormat'?: number;
    'fileSize'?: string;
    'thumbWidth'?: number;
    'thumbHeight'?: number;
    'busiType'?: 0;
    'subBusiType'?: 0;
    'thumbPath'?: Map<number, any>;
    'transferStatus'?: 0;
    'progress'?: 0;
    'invalidState'?: 0;
    'fileUuid'?: string;
    'fileSubId'?: '';
    'fileBizId'?: null;
    'originVideoMd5'?: '';
    'import_rich_media_context'?: null;
    'sourceVideoCodecFormat'?: number;
}
export interface MarkdownElement {
    content: string;
}
export interface InlineKeyboardElementRowButton {
    'id': '';
    'label': string;
    'visitedLabel': string;
    'style': 1;
    'type': 2;
    'clickLimit': 0;
    'unsupportTips': '请升级新版手机QQ';
    'data': string;
    'atBotShowChannelList': false;
    'permissionType': 2;
    'specifyRoleIds': [];
    'specifyTinyids': [];
    'isReply': false;
    'anchor': 0;
    'enter': false;
    'subscribeDataTemplateIds': [];
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
    'type': TipGroupElementType;
    'role': 0;
    'groupName': string;
    'memberUid': string;
    'memberNick': string;
    'memberRemark': string;
    'adminUid': string;
    'adminNick': string;
    'adminRemark': string;
    'createGroup': null;
    'memberAdd'?: {
        'showType': 1;
        'otherAdd': null;
        'otherAddByOtherQRCode': null;
        'otherAddByYourQRCode': null;
        'youAddByOtherQRCode': null;
        'otherInviteOther': null;
        'otherInviteYou': null;
        'youInviteOther': null;
    };
    'shutUp'?: {
        'curTime': string;
        'duration': string;
        'admin': {
            'uid': string;
            'card': string;
            'name': string;
            'role': GroupMemberRole;
        };
        'member': {
            'uid': string;
            'card': string;
            'name': string;
            'role': GroupMemberRole;
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
