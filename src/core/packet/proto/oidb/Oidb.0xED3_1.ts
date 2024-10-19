import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";

// Send Poke
export const OidbSvcTrpcTcp0XED3_1 = {
    uin: ProtoField(1, ScalarType.UINT32),
    groupUin: ProtoField(2, ScalarType.UINT32),
    friendUin: ProtoField(5, ScalarType.UINT32),
    ext: ProtoField(6, ScalarType.UINT32, true)
};
