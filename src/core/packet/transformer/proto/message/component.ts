import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { Elem } from '@/core/packet/transformer/proto';

export const Attr = {
    codePage: ProtoField(1, ScalarType.INT32),
    time: ProtoField(2, ScalarType.INT32),
    random: ProtoField(3, ScalarType.INT32),
    color: ProtoField(4, ScalarType.INT32),
    size: ProtoField(5, ScalarType.INT32),
    effect: ProtoField(6, ScalarType.INT32),
    charSet: ProtoField(7, ScalarType.INT32),
    pitchAndFamily: ProtoField(8, ScalarType.INT32),
    fontName: ProtoField(9, ScalarType.STRING),
    reserveData: ProtoField(10, ScalarType.BYTES),
};

export const NotOnlineFile = {
    fileType: ProtoField(1, ScalarType.INT32, true),
    sig: ProtoField(2, ScalarType.BYTES, true),
    fileUuid: ProtoField(3, ScalarType.STRING, true),
    fileMd5: ProtoField(4, ScalarType.BYTES, true),
    fileName: ProtoField(5, ScalarType.STRING, true),
    fileSize: ProtoField(6, ScalarType.INT64, true),
    note: ProtoField(7, ScalarType.BYTES, true),
    reserved: ProtoField(8, ScalarType.INT32, true),
    subcmd: ProtoField(9, ScalarType.INT32, true),
    microCloud: ProtoField(10, ScalarType.INT32, true),
    bytesFileUrls: ProtoField(11, ScalarType.BYTES, false, true),
    downloadFlag: ProtoField(12, ScalarType.INT32, true),
    dangerEvel: ProtoField(50, ScalarType.INT32, true),
    lifeTime: ProtoField(51, ScalarType.INT32, true),
    uploadTime: ProtoField(52, ScalarType.INT32, true),
    absFileType: ProtoField(53, ScalarType.INT32, true),
    clientType: ProtoField(54, ScalarType.INT32, true),
    expireTime: ProtoField(55, ScalarType.INT32, true),
    pbReserve: ProtoField(56, ScalarType.BYTES, true),
    fileHash: ProtoField(57, ScalarType.STRING, true),
};

export const Ptt = {
    fileType: ProtoField(1, ScalarType.INT32),
    srcUin: ProtoField(2, ScalarType.UINT64),
    fileUuid: ProtoField(3, ScalarType.STRING),
    fileMd5: ProtoField(4, ScalarType.BYTES),
    fileName: ProtoField(5, ScalarType.STRING),
    fileSize: ProtoField(6, ScalarType.INT32),
    reserve: ProtoField(7, ScalarType.BYTES),
    fileId: ProtoField(8, ScalarType.INT32),
    serverIp: ProtoField(9, ScalarType.INT32),
    serverPort: ProtoField(10, ScalarType.INT32),
    boolValid: ProtoField(11, ScalarType.BOOL),
    signature: ProtoField(12, ScalarType.BYTES),
    shortcut: ProtoField(13, ScalarType.BYTES),
    fileKey: ProtoField(14, ScalarType.BYTES),
    magicPttIndex: ProtoField(15, ScalarType.INT32),
    voiceSwitch: ProtoField(16, ScalarType.INT32),
    pttUrl: ProtoField(17, ScalarType.BYTES),
    groupFileKey: ProtoField(18, ScalarType.STRING),
    time: ProtoField(19, ScalarType.INT32),
    downPara: ProtoField(20, ScalarType.BYTES),
    format: ProtoField(29, ScalarType.INT32),
    pbReserve: ProtoField(30, ScalarType.BYTES),
    bytesPttUrls: ProtoField(31, ScalarType.BYTES, false, true),
    downloadFlag: ProtoField(32, ScalarType.INT32),
};

export const RichText = {
    attr: ProtoField(1, () => Attr, true),
    elems: ProtoField(2, () => Elem, false, true),
    notOnlineFile: ProtoField(3, () => NotOnlineFile, true),
    ptt: ProtoField(4, () => Ptt, true),
};

export const ButtonExtra = {
    data: ProtoField(1, () => KeyboardData),
};

export const KeyboardData = {
    rows: ProtoField(1, () => Row, false, true),
};

export const Row = {
    buttons: ProtoField(1, () => Button, false, true),
};

export const Button = {
    id: ProtoField(1, ScalarType.STRING),
    renderData: ProtoField(2, () => RenderData),
    action: ProtoField(3, () => Action),
};

export const RenderData = {
    label: ProtoField(1, ScalarType.STRING),
    visitedLabel: ProtoField(2, ScalarType.STRING),
    style: ProtoField(3, ScalarType.INT32),
};

export const Action = {
    type: ProtoField(1, ScalarType.INT32),
    permission: ProtoField(2, () => Permission),
    unsupportTips: ProtoField(4, ScalarType.STRING),
    data: ProtoField(5, ScalarType.STRING),
    reply: ProtoField(7, ScalarType.BOOL),
    enter: ProtoField(8, ScalarType.BOOL),
};

export const Permission = {
    type: ProtoField(1, ScalarType.INT32),
    specifyRoleIds: ProtoField(2, ScalarType.STRING, false, true),
    specifyUserIds: ProtoField(3, ScalarType.STRING, false, true),
};

export const FileExtra = {
    file: ProtoField(1, () => NotOnlineFile),
    field6: ProtoField(6, () => PrivateFileExtra),
};

export const PrivateFileExtra = {
    field2: ProtoField(2, () => PrivateFileExtraField2),
};

export const PrivateFileExtraField2 = {
    field1: ProtoField(1, ScalarType.UINT32),
    fileUuid: ProtoField(4, ScalarType.STRING),
    fileName: ProtoField(5, ScalarType.STRING),
    field6: ProtoField(6, ScalarType.UINT32),
    field7: ProtoField(7, ScalarType.BYTES),
    field8: ProtoField(8, ScalarType.BYTES),
    timestamp1: ProtoField(9, ScalarType.UINT32),
    fileHash: ProtoField(14, ScalarType.STRING),
    selfUid: ProtoField(15, ScalarType.STRING),
    destUid: ProtoField(16, ScalarType.STRING),
};

export const GroupFileExtra = {
    field1: ProtoField(1, ScalarType.UINT32),
    fileName: ProtoField(2, ScalarType.STRING),
    display: ProtoField(3, ScalarType.STRING),
    inner: ProtoField(7, () => GroupFileExtraInner),
};

export const GroupFileExtraInner = {
    info: ProtoField(2, () => GroupFileExtraInfo),
};

export const GroupFileExtraInfo = {
    busId: ProtoField(1, ScalarType.UINT32),
    fileId: ProtoField(2, ScalarType.STRING),
    fileSize: ProtoField(3, ScalarType.UINT64),
    fileName: ProtoField(4, ScalarType.STRING),
    field5: ProtoField(5, ScalarType.UINT32),
    fileSha: ProtoField(6, ScalarType.BYTES),
    extInfoString: ProtoField(7, ScalarType.STRING),
    fileMd5: ProtoField(8, ScalarType.BYTES),
};

export const ImageExtraUrl = {
    origUrl: ProtoField(30, ScalarType.STRING),
};

export const PokeExtra = {
    type: ProtoField(1, ScalarType.UINT32),
    field7: ProtoField(7, ScalarType.UINT32),
    field8: ProtoField(8, ScalarType.UINT32),
};
