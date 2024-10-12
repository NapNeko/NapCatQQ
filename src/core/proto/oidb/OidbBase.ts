import { ProtoField } from "../NapProto";
import { ScalarType } from '@protobuf-ts/runtime';

export const OidbSvcTrpcTcpBase = {
    command: ProtoField(1, ScalarType.UINT32),
    subCommand: ProtoField(2, ScalarType.UINT32),
    body: ProtoField(4, ScalarType.BYTES),
    isReserved: ProtoField(12, ScalarType.UINT32, false, true)
}