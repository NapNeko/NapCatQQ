import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OidbSvcTrpcTcp0XE37_1700 = {
    command: ProtoField(1, ScalarType.UINT32, true),
    seq: ProtoField(2, ScalarType.INT32, true),
    upload: ProtoField(19, () => ApplyUploadReqV3, true),
    businessId: ProtoField(101, ScalarType.INT32, true),
    clientType: ProtoField(102, ScalarType.INT32, true),
    flagSupportMediaPlatform: ProtoField(200, ScalarType.INT32, true),
};

export const ApplyUploadReqV3 = {
    senderUid: ProtoField(10, ScalarType.STRING, true),
    receiverUid: ProtoField(20, ScalarType.STRING, true),
    fileSize: ProtoField(30, ScalarType.UINT32, true),
    fileName: ProtoField(40, ScalarType.STRING, true),
    md510MCheckSum: ProtoField(50, ScalarType.BYTES, true),
    sha1CheckSum: ProtoField(60, ScalarType.BYTES, true),
    localPath: ProtoField(70, ScalarType.STRING, true),
    md5CheckSum: ProtoField(110, ScalarType.BYTES, true),
    sha3CheckSum: ProtoField(120, ScalarType.BYTES, true),
};
