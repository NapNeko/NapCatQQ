import { ProtoField, ScalarType } from '@napneko/nap-proto-core';
import { OidbSvcTrpcTcp0XE37_800_1200Metadata } from '@/core/packet/transformer/proto';

export const OidbSvcTrpcTcp0XE37_800 = {
    subCommand: ProtoField(1, ScalarType.UINT32),
    field2: ProtoField(2, ScalarType.INT32),
    body: ProtoField(10, () => OidbSvcTrpcTcp0XE37_800Body, true),
    field101: ProtoField(101, ScalarType.INT32),
    field102: ProtoField(102, ScalarType.INT32),
    field200: ProtoField(200, ScalarType.INT32)
};

export const OidbSvcTrpcTcp0XE37_800Body = {
    senderUid: ProtoField(10, ScalarType.STRING, true),
    receiverUid: ProtoField(20, ScalarType.STRING, true),
    fileUuid: ProtoField(30, ScalarType.STRING, true),
    fileHash: ProtoField(40, ScalarType.STRING, true)
};

export const OidbSvcTrpcTcp0XE37Response = {
    command: ProtoField(1, ScalarType.UINT32),
    seq: ProtoField(2, ScalarType.INT32),
    upload: ProtoField(19, () => ApplyUploadRespV3, true),
    businessId: ProtoField(101, ScalarType.INT32),
    clientType: ProtoField(102, ScalarType.INT32),
    flagSupportMediaPlatform: ProtoField(200, ScalarType.INT32)
};

export const ApplyUploadRespV3 = {
    retCode: ProtoField(10, ScalarType.INT32),
    retMsg: ProtoField(20, ScalarType.STRING, true),
    totalSpace: ProtoField(30, ScalarType.INT64),
    usedSpace: ProtoField(40, ScalarType.INT64),
    uploadedSize: ProtoField(50, ScalarType.INT64),
    uploadIp: ProtoField(60, ScalarType.STRING, true),
    uploadDomain: ProtoField(70, ScalarType.STRING, true),
    uploadPort: ProtoField(80, ScalarType.UINT32),
    uuid: ProtoField(90, ScalarType.STRING, true),
    uploadKey: ProtoField(100, ScalarType.BYTES, true),
    boolFileExist: ProtoField(110, ScalarType.BOOL),
    packSize: ProtoField(120, ScalarType.INT32),
    uploadIpList: ProtoField(130, ScalarType.STRING, false, true), // repeated
    uploadHttpsPort: ProtoField(140, ScalarType.INT32),
    uploadHttpsDomain: ProtoField(150, ScalarType.STRING, true),
    uploadDns: ProtoField(160, ScalarType.STRING, true),
    uploadLanip: ProtoField(170, ScalarType.STRING, true),
    fileAddon: ProtoField(200, ScalarType.STRING, true),
    mediaPlatformUploadKey: ProtoField(220, ScalarType.BYTES, true)
};

export const OidbSvcTrpcTcp0XE37_800Response = {
    command: ProtoField(1, ScalarType.UINT32, true),
    subCommand: ProtoField(2, ScalarType.UINT32, true),
    body: ProtoField(10, () => OidbSvcTrpcTcp0XE37_800ResponseBody, true),
    field50: ProtoField(50, ScalarType.UINT32, true),
};

export const OidbSvcTrpcTcp0XE37_800ResponseBody = {
    field10: ProtoField(10, ScalarType.UINT32, true),
    field30: ProtoField(30, () => OidbSvcTrpcTcp0XE37_800_1200Metadata, true),
};
