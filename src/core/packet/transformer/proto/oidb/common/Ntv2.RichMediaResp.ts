import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { CommonHead, MsgInfo, PicUrlExtInfo, VideoExtInfo } from '@/core/packet/transformer/proto';


export const NTV2RichMediaResp = {
    respHead: ProtoField(1, () => MultiMediaRespHead),
    upload: ProtoField(2, () => UploadResp),
    download: ProtoField(3, () => DownloadResp),
    downloadRKey: ProtoField(4, () => DownloadRKeyResp),
    delete: ProtoField(5, () => DeleteResp),
    uploadCompleted: ProtoField(6, () => UploadCompletedResp),
    msgInfoAuth: ProtoField(7, () => MsgInfoAuthResp),
    uploadKeyRenewal: ProtoField(8, () => UploadKeyRenewalResp),
    downloadSafe: ProtoField(9, () => DownloadSafeResp),
    extension: ProtoField(99, ScalarType.BYTES, true),
};

export const MultiMediaRespHead = {
    common: ProtoField(1, () => CommonHead),
    retCode: ProtoField(2, ScalarType.UINT32),
    message: ProtoField(3, ScalarType.STRING),
};

export const DownloadResp = {
    rKeyParam: ProtoField(1, ScalarType.STRING),
    rKeyTtlSecond: ProtoField(2, ScalarType.UINT32),
    info: ProtoField(3, () => DownloadInfo),
    rKeyCreateTime: ProtoField(4, ScalarType.UINT32),
};

export const DownloadInfo = {
    domain: ProtoField(1, ScalarType.STRING),
    urlPath: ProtoField(2, ScalarType.STRING),
    httpsPort: ProtoField(3, ScalarType.UINT32),
    ipv4s: ProtoField(4, () => IPv4, false, true),
    ipv6s: ProtoField(5, () => IPv6, false, true),
    picUrlExtInfo: ProtoField(6, () => PicUrlExtInfo),
    videoExtInfo: ProtoField(7, () => VideoExtInfo),
};

export const IPv4 = {
    outIP: ProtoField(1, ScalarType.UINT32),
    outPort: ProtoField(2, ScalarType.UINT32),
    inIP: ProtoField(3, ScalarType.UINT32),
    inPort: ProtoField(4, ScalarType.UINT32),
    ipType: ProtoField(5, ScalarType.UINT32),
};

export const IPv6 = {
    outIP: ProtoField(1, ScalarType.BYTES),
    outPort: ProtoField(2, ScalarType.UINT32),
    inIP: ProtoField(3, ScalarType.BYTES),
    inPort: ProtoField(4, ScalarType.UINT32),
    ipType: ProtoField(5, ScalarType.UINT32),
};

export const UploadResp = {
    uKey: ProtoField(1, ScalarType.STRING, true),
    uKeyTtlSecond: ProtoField(2, ScalarType.UINT32),
    ipv4s: ProtoField(3, () => IPv4, false, true),
    ipv6s: ProtoField(4, () => IPv6, false, true),
    msgSeq: ProtoField(5, ScalarType.UINT64),
    msgInfo: ProtoField(6, () => MsgInfo),
    ext: ProtoField(7, () => RichMediaStorageTransInfo, false, true),
    compatQMsg: ProtoField(8, ScalarType.BYTES),
    subFileInfos: ProtoField(10, () => SubFileInfo, false, true),
};

export const RichMediaStorageTransInfo = {
    subType: ProtoField(1, ScalarType.UINT32),
    extType: ProtoField(2, ScalarType.UINT32),
    extValue: ProtoField(3, ScalarType.BYTES),
};

export const SubFileInfo = {
    subType: ProtoField(1, ScalarType.UINT32),
    uKey: ProtoField(2, ScalarType.STRING),
    uKeyTtlSecond: ProtoField(3, ScalarType.UINT32),
    ipv4s: ProtoField(4, () => IPv4, false, true),
    ipv6s: ProtoField(5, () => IPv6, false, true),
};

export const DownloadSafeResp = {
};

export const UploadKeyRenewalResp = {
    ukey: ProtoField(1, ScalarType.STRING),
    ukeyTtlSec: ProtoField(2, ScalarType.UINT64),
};

export const MsgInfoAuthResp = {
    authCode: ProtoField(1, ScalarType.UINT32),
    msg: ProtoField(2, ScalarType.BYTES),
    resultTime: ProtoField(3, ScalarType.UINT64),
};

export const UploadCompletedResp = {
    msgSeq: ProtoField(1, ScalarType.UINT64),
};

export const DeleteResp = {
};

export const DownloadRKeyResp = {
    rKeys: ProtoField(1, () => RKeyInfo, false, true),
};

export const RKeyInfo = {
    rkey: ProtoField(1, ScalarType.STRING),
    rkeyTtlSec: ProtoField(2, ScalarType.UINT64),
    storeId: ProtoField(3, ScalarType.UINT32),
    rkeyCreateTime: ProtoField(4, ScalarType.UINT32, true),
    type: ProtoField(5, ScalarType.UINT32, true),
};
