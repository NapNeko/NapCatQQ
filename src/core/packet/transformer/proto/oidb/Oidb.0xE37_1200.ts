import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OidbSvcTrpcTcp0XE37_1200 = {
    subCommand: ProtoField(1, ScalarType.UINT32, true),
    field2: ProtoField(2, ScalarType.INT32, true),
    body: ProtoField(14, () => OidbSvcTrpcTcp0XE37_1200Body, true),
    field101: ProtoField(101, ScalarType.INT32, true),
    field102: ProtoField(102, ScalarType.INT32, true),
    field200: ProtoField(200, ScalarType.INT32, true),
    field99999: ProtoField(99999, ScalarType.BYTES, true),
};

export const OidbSvcTrpcTcp0XE37_1200Body = {
    receiverUid: ProtoField(10, ScalarType.STRING, true),
    fileUuid: ProtoField(20, ScalarType.STRING, true),
    type: ProtoField(30, ScalarType.INT32, true),
    fileHash: ProtoField(60, ScalarType.STRING, true),
    t2: ProtoField(601, ScalarType.INT32, true),
};

export const OidbSvcTrpcTcp0XE37_1200Response = {
    command: ProtoField(1, ScalarType.UINT32, true),
    subCommand: ProtoField(2, ScalarType.UINT32, true),
    body: ProtoField(14, () => OidbSvcTrpcTcp0XE37_1200ResponseBody, true),
    field50: ProtoField(50, ScalarType.UINT32, true),
};

export const OidbSvcTrpcTcp0XE37_1200ResponseBody = {
    field10: ProtoField(10, ScalarType.UINT32, true),
    state: ProtoField(20, ScalarType.STRING, true),
    result: ProtoField(30, () => OidbSvcTrpcTcp0XE37_1200Result, true),
    metadata: ProtoField(40, () => OidbSvcTrpcTcp0XE37_800_1200Metadata, true),
};

export const OidbSvcTrpcTcp0XE37_1200Result = {
    server: ProtoField(20, ScalarType.STRING, true),
    port: ProtoField(40, ScalarType.UINT32, true),
    url: ProtoField(50, ScalarType.STRING, true),
    additionalServer: ProtoField(60, ScalarType.STRING, false, true),
    ssoPort: ProtoField(80, ScalarType.UINT32, true),
    ssoUrl: ProtoField(90, ScalarType.STRING, true),
    extra: ProtoField(120, ScalarType.BYTES, true),
};

export const OidbSvcTrpcTcp0XE37_800_1200Metadata = {
    uin: ProtoField(1, ScalarType.UINT32, true),
    field2: ProtoField(2, ScalarType.UINT32, true),
    field3: ProtoField(3, ScalarType.UINT32, true),
    size: ProtoField(4, ScalarType.UINT32, true),
    timestamp: ProtoField(5, ScalarType.UINT32, true),
    fileUuid: ProtoField(6, ScalarType.STRING, true),
    fileName: ProtoField(7, ScalarType.STRING, true),
    field100: ProtoField(100, ScalarType.BYTES, true),
    field101: ProtoField(101, ScalarType.BYTES, true),
    field110: ProtoField(110, ScalarType.UINT32, true),
    timestamp1: ProtoField(130, ScalarType.UINT32, true),
    fileHash: ProtoField(140, ScalarType.STRING, true),
    field141: ProtoField(141, ScalarType.BYTES, true),
    field142: ProtoField(142, ScalarType.BYTES, true),
};
