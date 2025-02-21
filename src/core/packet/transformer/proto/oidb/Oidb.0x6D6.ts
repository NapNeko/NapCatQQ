import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OidbSvcTrpcTcp0x6D6 = {
    file: ProtoField(1, () => OidbSvcTrpcTcp0x6D6Upload, true),
    download: ProtoField(3, () => OidbSvcTrpcTcp0x6D6Download, true),
    delete: ProtoField(4, () => OidbSvcTrpcTcp0x6D6Delete, true),
    rename: ProtoField(5, () => OidbSvcTrpcTcp0x6D6Rename, true),
    move: ProtoField(6, () => OidbSvcTrpcTcp0x6D6Move, true),
};

export const OidbSvcTrpcTcp0x6D6Upload = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    appId: ProtoField(2, ScalarType.UINT32),
    busId: ProtoField(3, ScalarType.UINT32),
    entrance: ProtoField(4, ScalarType.UINT32),
    targetDirectory: ProtoField(5, ScalarType.STRING),
    fileName: ProtoField(6, ScalarType.STRING),
    localDirectory: ProtoField(7, ScalarType.STRING),
    fileSize: ProtoField(8, ScalarType.UINT64),
    fileSha1: ProtoField(9, ScalarType.BYTES),
    fileSha3: ProtoField(10, ScalarType.BYTES),
    fileMd5: ProtoField(11, ScalarType.BYTES),
    field15: ProtoField(15, ScalarType.BOOL),
};

export const OidbSvcTrpcTcp0x6D6Download = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    appId: ProtoField(2, ScalarType.UINT32),
    busId: ProtoField(3, ScalarType.UINT32),
    fileId: ProtoField(4, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0x6D6Delete = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    busId: ProtoField(3, ScalarType.UINT32),
    fileId: ProtoField(5, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0x6D6Rename = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    busId: ProtoField(3, ScalarType.UINT32),
    fileId: ProtoField(4, ScalarType.STRING),
    parentFolder: ProtoField(5, ScalarType.STRING),
    newFileName: ProtoField(6, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0x6D6Move = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    appId: ProtoField(2, ScalarType.UINT32),
    busId: ProtoField(3, ScalarType.UINT32),
    fileId: ProtoField(4, ScalarType.STRING),
    parentDirectory: ProtoField(5, ScalarType.STRING),
    targetDirectory: ProtoField(6, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0x6D6Response = {
    upload: ProtoField(1, () => OidbSvcTrpcTcp0x6D6_0Response),
    download: ProtoField(3, () => OidbSvcTrpcTcp0x6D6_2Response),
    delete: ProtoField(4, () => OidbSvcTrpcTcp0x6D6_3_4_5Response),
    rename: ProtoField(5, () => OidbSvcTrpcTcp0x6D6_3_4_5Response),
    move: ProtoField(6, () => OidbSvcTrpcTcp0x6D6_3_4_5Response),
};

export const OidbSvcTrpcTcp0x6D6_0Response = {
    retCode: ProtoField(1, ScalarType.INT32),
    retMsg: ProtoField(2, ScalarType.STRING),
    clientWording: ProtoField(3, ScalarType.STRING),
    uploadIp: ProtoField(4, ScalarType.STRING),
    serverDns: ProtoField(5, ScalarType.STRING),
    busId: ProtoField(6, ScalarType.INT32),
    fileId: ProtoField(7, ScalarType.STRING),
    checkKey: ProtoField(8, ScalarType.BYTES),
    fileKey: ProtoField(9, ScalarType.BYTES),
    boolFileExist: ProtoField(10, ScalarType.BOOL),
    uploadIpLanV4: ProtoField(12, ScalarType.STRING, false, true),
    uploadIpLanV6: ProtoField(13, ScalarType.STRING, false, true),
    uploadPort: ProtoField(14, ScalarType.UINT32),
};

export const OidbSvcTrpcTcp0x6D6_2Response = {
    retCode: ProtoField(1, ScalarType.INT32),
    retMsg: ProtoField(2, ScalarType.STRING),
    clientWording: ProtoField(3, ScalarType.STRING),
    downloadIp: ProtoField(4, ScalarType.STRING),
    downloadDns: ProtoField(5, ScalarType.STRING),
    downloadUrl: ProtoField(6, ScalarType.BYTES),
    fileSha1: ProtoField(7, ScalarType.BYTES),
    fileSha3: ProtoField(8, ScalarType.BYTES),
    fileMd5: ProtoField(9, ScalarType.BYTES),
    cookieVal: ProtoField(10, ScalarType.BYTES),
    saveFileName: ProtoField(11, ScalarType.STRING),
    previewPort: ProtoField(12, ScalarType.UINT32),
};

export const OidbSvcTrpcTcp0x6D6_3_4_5Response = {
    retCode: ProtoField(1, ScalarType.INT32),
    retMsg: ProtoField(2, ScalarType.STRING),
    clientWording: ProtoField(3, ScalarType.STRING),
};
