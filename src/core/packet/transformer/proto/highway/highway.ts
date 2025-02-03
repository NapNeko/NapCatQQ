import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { MsgInfoBody } from '@/core/packet/transformer/proto';

export const DataHighwayHead = {
    version: ProtoField(1, ScalarType.UINT32),
    uin: ProtoField(2, ScalarType.STRING, true),
    command: ProtoField(3, ScalarType.STRING, true),
    seq: ProtoField(4, ScalarType.UINT32, true),
    retryTimes: ProtoField(5, ScalarType.UINT32, true),
    appId: ProtoField(6, ScalarType.UINT32),
    dataFlag: ProtoField(7, ScalarType.UINT32),
    commandId: ProtoField(8, ScalarType.UINT32),
    buildVer: ProtoField(9, ScalarType.BYTES, true),
};

export const FileUploadExt = {
    unknown1: ProtoField(1, ScalarType.INT32),
    unknown2: ProtoField(2, ScalarType.INT32),
    unknown3: ProtoField(3, ScalarType.INT32),
    entry: ProtoField(100, () => FileUploadEntry),
    unknown200: ProtoField(200, ScalarType.INT32),
};

export const FileUploadEntry = {
    busiBuff: ProtoField(100, () => ExcitingBusiInfo),
    fileEntry: ProtoField(200, () => ExcitingFileEntry),
    clientInfo: ProtoField(300, () => ExcitingClientInfo),
    fileNameInfo: ProtoField(400, () => ExcitingFileNameInfo),
    host: ProtoField(500, () => ExcitingHostConfig),
};

export const ExcitingBusiInfo = {
    busId: ProtoField(1, ScalarType.INT32),
    senderUin: ProtoField(100, ScalarType.UINT64),
    receiverUin: ProtoField(200, ScalarType.UINT64),
    groupCode: ProtoField(400, ScalarType.UINT64),
};

export const ExcitingFileEntry = {
    fileSize: ProtoField(100, ScalarType.UINT64),
    md5: ProtoField(200, ScalarType.BYTES),
    checkKey: ProtoField(300, ScalarType.BYTES),
    md5S2: ProtoField(400, ScalarType.BYTES),
    fileId: ProtoField(600, ScalarType.STRING),
    uploadKey: ProtoField(700, ScalarType.BYTES),
};

export const ExcitingClientInfo = {
    clientType: ProtoField(100, ScalarType.INT32),
    appId: ProtoField(200, ScalarType.STRING),
    terminalType: ProtoField(300, ScalarType.INT32),
    clientVer: ProtoField(400, ScalarType.STRING),
    unknown: ProtoField(600, ScalarType.INT32),
};

export const ExcitingFileNameInfo = {
    fileName: ProtoField(100, ScalarType.STRING),
};

export const ExcitingHostConfig = {
    hosts: ProtoField(200, () => ExcitingHostInfo, false, true),
};

export const ExcitingHostInfo = {
    url: ProtoField(1, () => ExcitingUrlInfo),
    port: ProtoField(2, ScalarType.UINT32),
};

export const ExcitingUrlInfo = {
    unknown: ProtoField(1, ScalarType.INT32),
    host: ProtoField(2, ScalarType.STRING),
};

export const LoginSigHead = {
    uint32LoginSigType: ProtoField(1, ScalarType.UINT32),
    bytesLoginSig: ProtoField(2, ScalarType.BYTES),
    appId: ProtoField(3, ScalarType.UINT32),
};

export const NTV2RichMediaHighwayExt = {
    fileUuid: ProtoField(1, ScalarType.STRING),
    uKey: ProtoField(2, ScalarType.STRING),
    network: ProtoField(5, () => NTHighwayNetwork),
    msgInfoBody: ProtoField(6, () => MsgInfoBody, false, true),
    blockSize: ProtoField(10, ScalarType.UINT32),
    hash: ProtoField(11, () => NTHighwayHash),
};

export const NTHighwayHash = {
    fileSha1: ProtoField(1, ScalarType.BYTES, false, true),
};

export const NTHighwayNetwork = {
    ipv4s: ProtoField(1, () => NTHighwayIPv4, false, true),
};

export const NTHighwayIPv4 = {
    domain: ProtoField(1, () => NTHighwayDomain),
    port: ProtoField(2, ScalarType.UINT32),
};

export const NTHighwayDomain = {
    isEnable: ProtoField(1, ScalarType.BOOL),
    ip: ProtoField(2, ScalarType.STRING),
};

export const ReqDataHighwayHead = {
    msgBaseHead: ProtoField(1, () => DataHighwayHead, true),
    msgSegHead: ProtoField(2, () => SegHead, true),
    bytesReqExtendInfo: ProtoField(3, ScalarType.BYTES, true),
    timestamp: ProtoField(4, ScalarType.UINT64),
    msgLoginSigHead: ProtoField(5, () => LoginSigHead, true),
};

export const RespDataHighwayHead = {
    msgBaseHead: ProtoField(1, () => DataHighwayHead, true),
    msgSegHead: ProtoField(2, () => SegHead, true),
    errorCode: ProtoField(3, ScalarType.UINT32),
    allowRetry: ProtoField(4, ScalarType.UINT32),
    cacheCost: ProtoField(5, ScalarType.UINT32),
    htCost: ProtoField(6, ScalarType.UINT32),
    bytesRspExtendInfo: ProtoField(7, ScalarType.BYTES, true),
    timestamp: ProtoField(8, ScalarType.UINT64),
    range: ProtoField(9, ScalarType.UINT64),
    isReset: ProtoField(10, ScalarType.UINT32),
};

export const SegHead = {
    serviceId: ProtoField(1, ScalarType.UINT32, true),
    filesize: ProtoField(2, ScalarType.UINT64),
    dataOffset: ProtoField(3, ScalarType.UINT64, true),
    dataLength: ProtoField(4, ScalarType.UINT32),
    retCode: ProtoField(5, ScalarType.UINT32, true),
    serviceTicket: ProtoField(6, ScalarType.BYTES),
    flag: ProtoField(7, ScalarType.UINT32, true),
    md5: ProtoField(8, ScalarType.BYTES),
    fileMd5: ProtoField(9, ScalarType.BYTES),
    cacheAddr: ProtoField(10, ScalarType.UINT32, true),
    queryTimes: ProtoField(11, ScalarType.UINT32),
    updateCacheIp: ProtoField(12, ScalarType.UINT32),
    cachePort: ProtoField(13, ScalarType.UINT32, true),
};

export const GroupAvatarExtra = {
    type: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    field3: ProtoField(3, () => GroupAvatarExtraField3),
    field5: ProtoField(5, ScalarType.UINT32),
    field6: ProtoField(6, ScalarType.UINT32),
};

export const GroupAvatarExtraField3 = {
    field1: ProtoField(1, ScalarType.UINT32),
};
