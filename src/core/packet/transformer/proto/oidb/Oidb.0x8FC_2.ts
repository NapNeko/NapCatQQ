import { ProtoField, ScalarType } from '@napneko/nap-proto-core';


//设置群头衔 OidbSvcTrpcTcp.0x8fc_2
export const OidbSvcTrpcTcp0X8FC_2_Body = {
    targetUid: ProtoField(1, ScalarType.STRING),
    specialTitle: ProtoField(5, ScalarType.STRING, true),
    expiredTime: ProtoField(6, ScalarType.INT32),
    uinName: ProtoField(7, ScalarType.STRING, true),
    targetName: ProtoField(8, ScalarType.STRING),
};
export const OidbSvcTrpcTcp0X8FC_2 = {
    groupUin: ProtoField(1, ScalarType.UINT32),
    body: ProtoField(3, () => OidbSvcTrpcTcp0X8FC_2_Body),
};
