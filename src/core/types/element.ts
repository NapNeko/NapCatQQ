import {
    ElementType,
    MessageElement,
    NTGrayTipElementSubTypeV2,
    PicSubType,
    PicType,
    TipAioOpGrayTipElement,
    TipGroupElement,
    NTVideoType,
    FaceType,
    Peer
} from './msg';

type ElementFullBase = Omit<MessageElement, 'elementType' | 'elementId' | 'extBufForUI'>;

export interface SendElementBase<ET extends ElementType> {
    elementType: ET;
    elementId: string;
    extBufForUI?: string;
}

type ElementBase<
    K extends keyof ElementFullBase,
    S extends Partial<{ [P in K]: keyof NonNullable<ElementFullBase[P]> | Array<keyof NonNullable<ElementFullBase[P]>> }> = object
> = {
        [P in K]:
        S[P] extends Array<infer U>
        ? Pick<NonNullable<ElementFullBase[P]>, U & keyof NonNullable<ElementFullBase[P]>>
        : S[P] extends keyof NonNullable<ElementFullBase[P]>
        ? Pick<NonNullable<ElementFullBase[P]>, S[P]>
        : NonNullable<ElementFullBase[P]>;
    };

export interface TextElement {
    content: string;
    atType: number;
    atUid: string;
    atTinyId: string;
    atNtUid: string;
}

export interface FaceElement {
    pokeType?: number;
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
    chainCount?: number;
}
export interface GrayTipRovokeElement {
    operatorRole: string;
    operatorUid: string;
    operatorNick: string;
    operatorRemark: string;
    isSelfOperate: boolean; // 是否是自己撤回的
    operatorMemRemark?: string;
    wording: string;  // 自定义的撤回提示语
}

export interface GrayTipElement {
    subElementType: NTGrayTipElementSubTypeV2;
    revokeElement: GrayTipRovokeElement;
    aioOpGrayTipElement: TipAioOpGrayTipElement;
    groupElement: TipGroupElement;
    xmlElement: {
        busiId: string;
        content: string;
        templId: string;
    };
    jsonGrayTipElement: {
        busiId?: number;
        jsonStr: string;
    };
}


export interface ArkElement {
    bytesData: string;
    linkInfo: null;
    subElementType: null;
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
    fileFormat?: NTVideoType;  // 2表示mp4 参考下面条目
    fileSize?: string;  // byte
    thumbWidth?: number;
    thumbHeight?: number;
    busiType?: 0; //
    subBusiType?: 0; // 未知
    thumbPath?: Map<number, unknown>;
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
    originImageUrl?: string;
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

// 非element
interface InlineKeyboardRow {
    buttons: InlineKeyboardButton[];
}

// 非element
interface TofuElementContent {
    color: string;
    tittle: string;
}

export interface ActionBarElement {
    rows: InlineKeyboardRow[];
    botAppid: string;
}

export interface RecommendedMsgElement {
    rows: InlineKeyboardRow[];
    botAppid: string;
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

export interface ShareLocationElement {
    text: string;
    ext: string;
}

export interface StructLongMsgElement {
    xmlContent: string;
    resId: string;
}

export interface ReplyElement {
    sourceMsgIdInRecords?: string;
    replayMsgSeq: string;
    replayMsgId: string;
    senderUin: string;
    senderUidStr?: string;
    replyMsgTime?: string;
    replyMsgClientSeq?: string;
    // HACK: Attributes that were not originally available,
    // but were added due to NTQQ and NapCat's internal implementation, are used to supplement NapCat
    _replyMsgPeer?: Peer;
}

export interface CalendarElement {
    summary: string;
    msg: string;
    expireTimeMs: string;
    schemaType: number;
    schema: string;
}

export interface GiphyElement {
    id: string;
    isClip: boolean;
    width: number;
    height: number;
}

export interface AvRecordElement {
    type: number;
    time: string;
    text: string;
    mainType: number;
    hasRead: boolean;
    extraType: number;
}

// 非element
interface YoloUserInfo {
    uid: string;
    result: number;
    rank: number;
    bizId: string;
}

export interface YoloGameResultElement {
    UserInfo: YoloUserInfo[];
}

export interface FaceBubbleElement {
    faceCount: number;
    faceSummary: string;
    faceFlag: number;
    content: string;
    oldVersionStr: string;
    faceType: FaceType;
    others: string;
    yellowFaceInfo: {
        index: number;
        buf: string;
        compatibleText: string;
        text: string;
    };
}

export interface TaskTopMsgElement {
    msgTitle: string;
    msgSummary: string;
    iconUrl: string;
    topMsgType: number;
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
    fileUuid: string; // FileId
    formatType: number; // Todo 已定义 但是未替换
    invalidState: number;
    md5HexStr: string;
    playState: number;
    progress: number; //进度
    text: string;
    transferStatus: number;
    translateStatus: number;
    voiceChangeType: number;
    voiceType: number;
    waveAmplitudes: number[];
    autoConvertText: number;
}

export type SendRecommendedMsgElement = SendElementBase<ElementType.RECOMMENDEDMSG> & ElementBase<'recommendedMsgElement'>;

export type SendTaskTopMsgElement = SendElementBase<ElementType.TASKTOPMSG> & ElementBase<'taskTopMsgElement'>;

export type SendTofuRecordElement = SendElementBase<ElementType.TOFURECORD> & ElementBase<'tofuRecordElement'>;

export type SendFaceBubbleElement = SendElementBase<ElementType.FACEBUBBLE> & ElementBase<'faceBubbleElement'>;

export type SendAvRecordElement = SendElementBase<ElementType.AVRECORD> & ElementBase<'avRecordElement'>;

export type SendInlineKeyboardElement = SendElementBase<ElementType.INLINEKEYBOARD> & ElementBase<'inlineKeyboardElement'>;

export type SendYoloGameResultElement = SendElementBase<ElementType.YOLOGAMERESULT> & ElementBase<'yoloGameResultElement'>;

export type SendGiphyElement = SendElementBase<ElementType.GIPHY> & ElementBase<'giphyElement'>;

export type SendWalletElement = SendElementBase<ElementType.UNKNOWN> & ElementBase<'walletElement'>;

export type SendCalendarElement = SendElementBase<ElementType.CALENDAR> & ElementBase<'calendarElement'>;

export type SendLiveGiftElement = SendElementBase<ElementType.LIVEGIFT> & ElementBase<'liveGiftElement'>;

export type SendTextElement = SendElementBase<ElementType.TEXT> & ElementBase<'textElement'>;

export type SendReplyElement = SendElementBase<ElementType.REPLY> & ElementBase<'replyElement'>;

export type SendFaceElement = SendElementBase<ElementType.FACE> & ElementBase<'faceElement'>;

export type SendMarketFaceElement = SendElementBase<ElementType.MFACE> & ElementBase<'marketFaceElement'>;

export type SendStructLongMsgElement = SendElementBase<ElementType.STRUCTLONGMSG> & ElementBase<'structLongMsgElement'>;

export type SendPicElement = SendElementBase<ElementType.PIC> & ElementBase<'picElement'>;

export type SendPttElement = SendElementBase<ElementType.PTT> & ElementBase<'pttElement', {
    pttElement: ['fileName', 'filePath', 'md5HexStr', 'fileSize', 'duration', 'formatType', 'voiceType',
        'voiceChangeType', 'canConvert2Text', 'waveAmplitudes', 'fileSubId', 'playState', 'autoConvertText']
}>;

export type SendFileElement = SendElementBase<ElementType.FILE> & ElementBase<'fileElement'>;

export type SendVideoElement = SendElementBase<ElementType.VIDEO> & ElementBase<'videoElement'>;

export type SendArkElement = SendElementBase<ElementType.ARK> & ElementBase<'arkElement'>;

export type SendMarkdownElement = SendElementBase<ElementType.MARKDOWN> & ElementBase<'markdownElement'>;

export type SendShareLocationElement = SendElementBase<ElementType.SHARELOCATION> & ElementBase<'shareLocationElement'>;

export type SendMultiForwardMsgElement = SendElementBase<ElementType.MULTIFORWARD> & ElementBase<'multiForwardMsgElement'>;

export type SendMessageElement = SendTextElement | SendPttElement |
    SendPicElement | SendReplyElement | SendFaceElement | SendMarketFaceElement | SendFileElement |
    SendVideoElement | SendArkElement | SendMarkdownElement | SendShareLocationElement;
