import { ProtoField } from "./NapProto";
import { ScalarType } from '@protobuf-ts/runtime';

export const OidbSvcTrpcTcpBaseProto = {
    command: ProtoField(1, ScalarType.UINT32),
    subCommand: ProtoField(2, ScalarType.UINT32),
    body: ProtoField(4, ScalarType.BYTES),
    isReserved: ProtoField(12, ScalarType.UINT32, false, true)
}

export const OidbSvcTrpcTcp0XED3_1 = {
    uin: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32, false, true),
    friendUin: ProtoField(5, ScalarType.BYTES, false, true),
    ext: ProtoField(6, ScalarType.UINT32)
}