import { ProtoField, ScalarType } from '@napneko/nap-proto-core';

export const OidbSvcTrpcTcp0XEB7_Body = {
    uin: ProtoField(1, ScalarType.STRING),
    groupUin: ProtoField(2, ScalarType.STRING),
    version: ProtoField(3, ScalarType.STRING),
};

export const OidbSvcTrpcTcp0XEB7 = {
    body: ProtoField(2, () => OidbSvcTrpcTcp0XEB7_Body),
};
