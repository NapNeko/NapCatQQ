import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const Elem = {
    text: ProtoField(1, () => Text, true),
    face: ProtoField(2, () => Face, true),
    onlineImage: ProtoField(3, () => OnlineImage, true),
    notOnlineImage: ProtoField(4, () => NotOnlineImage, true),
    transElem: ProtoField(5, () => TransElem, true),
    marketFace: ProtoField(6, () => MarketFace, true),
    customFace: ProtoField(8, () => CustomFace, true),
    elemFlags2: ProtoField(9, () => ElemFlags2, true),
    richMsg: ProtoField(12, () => RichMsg, true),
    groupFile: ProtoField(13, () => GroupFile, true),
    extraInfo: ProtoField(16, () => ExtraInfo, true),
    videoFile: ProtoField(19, () => VideoFile, true),
    anonymousGroupMessage: ProtoField(21, () => AnonymousGroupMessage, true),
    customElem: ProtoField(31, () => CustomElem, true),
    generalFlags: ProtoField(37, () => GeneralFlags, true),
    srcMsg: ProtoField(45, () => SrcMsg, true),
    lightAppElem: ProtoField(51, () => LightAppElem, true),
    commonElem: ProtoField(53, () => CommonElem, true),
};

export const Text = {
    str: ProtoField(1, ScalarType.STRING, true),
    lint: ProtoField(2, ScalarType.STRING, true),
    attr6Buf: ProtoField(3, ScalarType.BYTES, true),
    attr7Buf: ProtoField(4, ScalarType.BYTES, true),
    buf: ProtoField(11, ScalarType.BYTES, true),
    pbReserve: ProtoField(12, ScalarType.BYTES, true),
};

export const Face = {
    index: ProtoField(1, ScalarType.INT32, true),
    old: ProtoField(2, ScalarType.BYTES, true),
    buf: ProtoField(11, ScalarType.BYTES, true),
};

export const OnlineImage = {
    guid: ProtoField(1, ScalarType.BYTES),
    filePath: ProtoField(2, ScalarType.BYTES),
    oldVerSendFile: ProtoField(3, ScalarType.BYTES),
};

export const NotOnlineImage = {
    filePath: ProtoField(1, ScalarType.STRING),
    fileLen: ProtoField(2, ScalarType.UINT32),
    downloadPath: ProtoField(3, ScalarType.STRING),
    oldVerSendFile: ProtoField(4, ScalarType.BYTES),
    imgType: ProtoField(5, ScalarType.INT32),
    previewsImage: ProtoField(6, ScalarType.BYTES),
    picMd5: ProtoField(7, ScalarType.BYTES),
    picHeight: ProtoField(8, ScalarType.UINT32),
    picWidth: ProtoField(9, ScalarType.UINT32),
    resId: ProtoField(10, ScalarType.STRING),
    flag: ProtoField(11, ScalarType.BYTES),
    thumbUrl: ProtoField(12, ScalarType.STRING),
    original: ProtoField(13, ScalarType.INT32),
    bigUrl: ProtoField(14, ScalarType.STRING),
    origUrl: ProtoField(15, ScalarType.STRING),
    bizType: ProtoField(16, ScalarType.INT32),
    result: ProtoField(17, ScalarType.INT32),
    index: ProtoField(18, ScalarType.INT32),
    opFaceBuf: ProtoField(19, ScalarType.BYTES),
    oldPicMd5: ProtoField(20, ScalarType.BOOL),
    thumbWidth: ProtoField(21, ScalarType.INT32),
    thumbHeight: ProtoField(22, ScalarType.INT32),
    fileId: ProtoField(23, ScalarType.INT32),
    showLen: ProtoField(24, ScalarType.UINT32),
    downloadLen: ProtoField(25, ScalarType.UINT32),
    x400Url: ProtoField(26, ScalarType.STRING),
    x400Width: ProtoField(27, ScalarType.INT32),
    x400Height: ProtoField(28, ScalarType.INT32),
    pbRes: ProtoField(29, () => NotOnlineImage_PbReserve),
};

export const NotOnlineImage_PbReserve = {
    subType: ProtoField(1, ScalarType.INT32),
    field3: ProtoField(3, ScalarType.INT32),
    field4: ProtoField(4, ScalarType.INT32),
    summary: ProtoField(8, ScalarType.STRING),
    field10: ProtoField(10, ScalarType.INT32),
    field20: ProtoField(20, () => NotOnlineImage_PbReserve2),
    url: ProtoField(30, ScalarType.STRING),
    md5Str: ProtoField(31, ScalarType.STRING),
};

export const NotOnlineImage_PbReserve2 = {
    field1: ProtoField(1, ScalarType.INT32),
    field2: ProtoField(2, ScalarType.STRING),
    field3: ProtoField(3, ScalarType.INT32),
    field4: ProtoField(4, ScalarType.INT32),
    field5: ProtoField(5, ScalarType.INT32),
    field7: ProtoField(7, ScalarType.STRING),
};

export const TransElem = {
    elemType: ProtoField(1, ScalarType.INT32),
    elemValue: ProtoField(2, ScalarType.BYTES),
};

export const MarketFace = {
    faceName: ProtoField(1, ScalarType.STRING),
    itemType: ProtoField(2, ScalarType.INT32),
    faceInfo: ProtoField(3, ScalarType.INT32),
    faceId: ProtoField(4, ScalarType.BYTES),
    tabId: ProtoField(5, ScalarType.INT32),
    subType: ProtoField(6, ScalarType.INT32),
    key: ProtoField(7, ScalarType.STRING),
    param: ProtoField(8, ScalarType.BYTES),
    mediaType: ProtoField(9, ScalarType.INT32),
    imageWidth: ProtoField(10, ScalarType.INT32),
    imageHeight: ProtoField(11, ScalarType.INT32),
    mobileparam: ProtoField(12, ScalarType.BYTES),
    pbReserve: ProtoField(13, () => MarketFacePbRes),
};

export const MarketFacePbRes = {
    field8: ProtoField(8, ScalarType.INT32)
};

export const CustomFace = {
    guid: ProtoField(1, ScalarType.BYTES),
    filePath: ProtoField(2, ScalarType.STRING),
    shortcut: ProtoField(3, ScalarType.STRING),
    buffer: ProtoField(4, ScalarType.BYTES),
    flag: ProtoField(5, ScalarType.BYTES),
    oldData: ProtoField(6, ScalarType.BYTES, true),
    fileId: ProtoField(7, ScalarType.UINT32),
    serverIp: ProtoField(8, ScalarType.INT32, true),
    serverPort: ProtoField(9, ScalarType.INT32, true),
    fileType: ProtoField(10, ScalarType.INT32),
    signature: ProtoField(11, ScalarType.BYTES),
    useful: ProtoField(12, ScalarType.INT32),
    md5: ProtoField(13, ScalarType.BYTES),
    thumbUrl: ProtoField(14, ScalarType.STRING),
    bigUrl: ProtoField(15, ScalarType.STRING),
    origUrl: ProtoField(16, ScalarType.STRING),
    bizType: ProtoField(17, ScalarType.INT32),
    repeatIndex: ProtoField(18, ScalarType.INT32),
    repeatImage: ProtoField(19, ScalarType.INT32),
    imageType: ProtoField(20, ScalarType.INT32),
    index: ProtoField(21, ScalarType.INT32),
    width: ProtoField(22, ScalarType.INT32),
    height: ProtoField(23, ScalarType.INT32),
    source: ProtoField(24, ScalarType.INT32),
    size: ProtoField(25, ScalarType.UINT32),
    origin: ProtoField(26, ScalarType.INT32),
    thumbWidth: ProtoField(27, ScalarType.INT32, true),
    thumbHeight: ProtoField(28, ScalarType.INT32, true),
    showLen: ProtoField(29, ScalarType.INT32),
    downloadLen: ProtoField(30, ScalarType.INT32),
    x400Url: ProtoField(31, ScalarType.STRING, true),
    x400Width: ProtoField(32, ScalarType.INT32),
    x400Height: ProtoField(33, ScalarType.INT32),
    pbRes: ProtoField(34, () => CustomFace_PbReserve, true),
};

export const CustomFace_PbReserve = {
    subType: ProtoField(1, ScalarType.INT32),
    summary: ProtoField(9, ScalarType.STRING),
};

export const ElemFlags2 = {
    colorTextId: ProtoField(1, ScalarType.UINT32),
    msgId: ProtoField(2, ScalarType.UINT64),
    whisperSessionId: ProtoField(3, ScalarType.UINT32),
    pttChangeBit: ProtoField(4, ScalarType.UINT32),
    vipStatus: ProtoField(5, ScalarType.UINT32),
    compatibleId: ProtoField(6, ScalarType.UINT32),
    insts: ProtoField(7, () => Instance, false, true),
    msgRptCnt: ProtoField(8, ScalarType.UINT32),
    srcInst: ProtoField(9, () => Instance),
    longtitude: ProtoField(10, ScalarType.UINT32),
    latitude: ProtoField(11, ScalarType.UINT32),
    customFont: ProtoField(12, ScalarType.UINT32),
    pcSupportDef: ProtoField(13, () => PcSupportDef),
    crmFlags: ProtoField(14, ScalarType.UINT32, true),
};

export const PcSupportDef = {
    pcPtlBegin: ProtoField(1, ScalarType.UINT32),
    pcPtlEnd: ProtoField(2, ScalarType.UINT32),
    macPtlBegin: ProtoField(3, ScalarType.UINT32),
    macPtlEnd: ProtoField(4, ScalarType.UINT32),
    ptlsSupport: ProtoField(5, ScalarType.INT32, false, true),
    ptlsNotSupport: ProtoField(6, ScalarType.UINT32, false, true),
};

export const Instance = {
    appId: ProtoField(1, ScalarType.UINT32),
    instId: ProtoField(2, ScalarType.UINT32),
};

export const RichMsg = {
    template1: ProtoField(1, ScalarType.BYTES, true),
    serviceId: ProtoField(2, ScalarType.INT32, true),
    msgResId: ProtoField(3, ScalarType.BYTES, true),
    rand: ProtoField(4, ScalarType.INT32, true),
    seq: ProtoField(5, ScalarType.UINT32, true),
};

export const GroupFile = {
    filename: ProtoField(1, ScalarType.BYTES),
    fileSize: ProtoField(2, ScalarType.UINT64),
    fileId: ProtoField(3, ScalarType.BYTES),
    batchId: ProtoField(4, ScalarType.BYTES),
    fileKey: ProtoField(5, ScalarType.BYTES),
    mark: ProtoField(6, ScalarType.BYTES),
    sequence: ProtoField(7, ScalarType.UINT64),
    batchItemId: ProtoField(8, ScalarType.BYTES),
    feedMsgTime: ProtoField(9, ScalarType.INT32),
    pbReserve: ProtoField(10, ScalarType.BYTES),
};

export const ExtraInfo = {
    nick: ProtoField(1, ScalarType.BYTES),
    groupCard: ProtoField(2, ScalarType.BYTES),
    level: ProtoField(3, ScalarType.INT32),
    flags: ProtoField(4, ScalarType.INT32),
    groupMask: ProtoField(5, ScalarType.INT32),
    msgTailId: ProtoField(6, ScalarType.INT32),
    senderTitle: ProtoField(7, ScalarType.BYTES),
    apnsTips: ProtoField(8, ScalarType.BYTES),
    uin: ProtoField(9, ScalarType.UINT64),
    msgStateFlag: ProtoField(10, ScalarType.INT32),
    apnsSoundType: ProtoField(11, ScalarType.INT32),
    newGroupFlag: ProtoField(12, ScalarType.INT32),
};

export const VideoFile = {
    fileUuid: ProtoField(1, ScalarType.STRING),
    fileMd5: ProtoField(2, ScalarType.BYTES),
    fileName: ProtoField(3, ScalarType.STRING),
    fileFormat: ProtoField(4, ScalarType.INT32),
    fileTime: ProtoField(5, ScalarType.INT32),
    fileSize: ProtoField(6, ScalarType.INT32),
    thumbWidth: ProtoField(7, ScalarType.INT32),
    thumbHeight: ProtoField(8, ScalarType.INT32),
    thumbFileMd5: ProtoField(9, ScalarType.BYTES),
    source: ProtoField(10, ScalarType.BYTES),
    thumbFileSize: ProtoField(11, ScalarType.INT32),
    busiType: ProtoField(12, ScalarType.INT32),
    fromChatType: ProtoField(13, ScalarType.INT32),
    toChatType: ProtoField(14, ScalarType.INT32),
    boolSupportProgressive: ProtoField(15, ScalarType.BOOL),
    fileWidth: ProtoField(16, ScalarType.INT32),
    fileHeight: ProtoField(17, ScalarType.INT32),
    subBusiType: ProtoField(18, ScalarType.INT32),
    videoAttr: ProtoField(19, ScalarType.INT32),
    bytesThumbFileUrls: ProtoField(20, ScalarType.BYTES, false, true),
    bytesVideoFileUrls: ProtoField(21, ScalarType.BYTES, false, true),
    thumbDownloadFlag: ProtoField(22, ScalarType.INT32),
    videoDownloadFlag: ProtoField(23, ScalarType.INT32),
    pbReserve: ProtoField(24, ScalarType.BYTES),
};

export const AnonymousGroupMessage = {
    flags: ProtoField(1, ScalarType.INT32),
    anonId: ProtoField(2, ScalarType.BYTES),
    anonNick: ProtoField(3, ScalarType.BYTES),
    headPortrait: ProtoField(4, ScalarType.INT32),
    expireTime: ProtoField(5, ScalarType.INT32),
    bubbleId: ProtoField(6, ScalarType.INT32),
    rankColor: ProtoField(7, ScalarType.BYTES),
};

export const CustomElem = {
    desc: ProtoField(1, ScalarType.BYTES),
    data: ProtoField(2, ScalarType.BYTES),
    enumType: ProtoField(3, ScalarType.INT32),
    ext: ProtoField(4, ScalarType.BYTES),
    sound: ProtoField(5, ScalarType.BYTES),
};

export const GeneralFlags = {
    bubbleDiyTextId: ProtoField(1, ScalarType.INT32),
    groupFlagNew: ProtoField(2, ScalarType.INT32),
    uin: ProtoField(3, ScalarType.UINT64),
    rpId: ProtoField(4, ScalarType.BYTES),
    prpFold: ProtoField(5, ScalarType.INT32),
    longTextFlag: ProtoField(6, ScalarType.INT32),
    longTextResId: ProtoField(7, ScalarType.STRING, true),
    groupType: ProtoField(8, ScalarType.INT32),
    toUinFlag: ProtoField(9, ScalarType.INT32),
    glamourLevel: ProtoField(10, ScalarType.INT32),
    memberLevel: ProtoField(11, ScalarType.INT32),
    groupRankSeq: ProtoField(12, ScalarType.UINT64),
    olympicTorch: ProtoField(13, ScalarType.INT32),
    babyqGuideMsgCookie: ProtoField(14, ScalarType.BYTES),
    uin32ExpertFlag: ProtoField(15, ScalarType.INT32),
    bubbleSubId: ProtoField(16, ScalarType.INT32),
    pendantId: ProtoField(17, ScalarType.UINT64),
    rpIndex: ProtoField(18, ScalarType.BYTES),
    pbReserve: ProtoField(19, ScalarType.BYTES),
};

export const SrcMsg = {
    origSeqs: ProtoField(1, ScalarType.UINT32, false, true),
    senderUin: ProtoField(2, ScalarType.UINT64),
    time: ProtoField(3, ScalarType.INT32, true),
    flag: ProtoField(4, ScalarType.INT32, true),
    elems: ProtoField(5, () => Elem, false, true),
    type: ProtoField(6, ScalarType.INT32, true),
    richMsg: ProtoField(7, ScalarType.BYTES, true),
    pbReserve: ProtoField(8, () => SrcMsgPbRes, true),
    sourceMsg: ProtoField(9, ScalarType.BYTES, true),
    toUin: ProtoField(10, ScalarType.UINT64, true),
    troopName: ProtoField(11, ScalarType.BYTES, true),
};

export const SrcMsgPbRes = {
    messageId: ProtoField(3, ScalarType.UINT64),
    senderUid: ProtoField(6, ScalarType.STRING, true),
    receiverUid: ProtoField(7, ScalarType.STRING, true),
    friendSeq: ProtoField(8, ScalarType.UINT32, true),
};

export const LightAppElem = {
    data: ProtoField(1, ScalarType.BYTES),
    msgResid: ProtoField(2, ScalarType.BYTES, true),
};

export const CommonElem = {
    serviceType: ProtoField(1, ScalarType.INT32),
    pbElem: ProtoField(2, ScalarType.BYTES),
    businessType: ProtoField(3, ScalarType.UINT32),
};

export const FaceExtra = {
    faceId: ProtoField(1, ScalarType.INT32, true),
};

export const MentionExtra = {
    type: ProtoField(3, ScalarType.INT32, true),
    uin: ProtoField(4, ScalarType.UINT32, true),
    field5: ProtoField(5, ScalarType.INT32, true),
    uid: ProtoField(9, ScalarType.STRING, true),
};

export const QBigFaceExtra = {
    AniStickerPackId: ProtoField(1, ScalarType.STRING, true),
    AniStickerId: ProtoField(2, ScalarType.STRING, true),
    faceId: ProtoField(3, ScalarType.INT32, true),
    sourceType: ProtoField(4, ScalarType.INT32, true),
    AniStickerType: ProtoField(5, ScalarType.INT32, true),
    resultId: ProtoField(6, ScalarType.STRING, true),
    preview: ProtoField(7, ScalarType.STRING, true),
    randomType: ProtoField(9, ScalarType.INT32, true),
};

export const QSmallFaceExtra = {
    faceId: ProtoField(1, ScalarType.UINT32),
    preview: ProtoField(2, ScalarType.STRING),
    preview2: ProtoField(3, ScalarType.STRING),
};

export const MarkdownData = {
    content: ProtoField(1, ScalarType.STRING)
};
