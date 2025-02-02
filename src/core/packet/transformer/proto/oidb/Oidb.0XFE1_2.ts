import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OidbSvcTrpcTcp0XFE1_2 = {
    uin: ProtoField(1, ScalarType.UINT32),
    key: ProtoField(3, () => OidbSvcTrpcTcp0XFE1_2Key, false, true),
};

export const OidbSvcTrpcTcp0XFE1_2Key = {
    key: ProtoField(1, ScalarType.UINT32)
};
export const OidbSvcTrpcTcp0XFE1_2RSP_Status = {
    key: ProtoField(1, ScalarType.UINT32),
    value: ProtoField(2, ScalarType.UINT64)
};

export const OidbSvcTrpcTcp0XFE1_2RSP_Data = {
    status: ProtoField(2, () => OidbSvcTrpcTcp0XFE1_2RSP_Status)
};

export const OidbSvcTrpcTcp0XFE1_2RSP = {
    data: ProtoField(1, () => OidbSvcTrpcTcp0XFE1_2RSP_Data)
};
