import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";

export const OidbSvcTrpcTcp0XED3_1 = {
    uin: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32, false, true),
    friendUin: ProtoField(5, ScalarType.BYTES, false, true),
    ext: ProtoField(6, ScalarType.UINT32)
}