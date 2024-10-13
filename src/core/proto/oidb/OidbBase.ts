import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";

export const OidbSvcTrpcTcpBase = {
    command: ProtoField(1, ScalarType.UINT32),
    subCommand: ProtoField(2, ScalarType.UINT32),
    body: ProtoField(4, ScalarType.BYTES),
    errorMsg: ProtoField(5, ScalarType.STRING, true),
    isReserved: ProtoField(12, ScalarType.UINT32)
}
export const OidbSvcTrpcTcpBaseRsp = {
    body: ProtoField(4, ScalarType.BYTES)
}