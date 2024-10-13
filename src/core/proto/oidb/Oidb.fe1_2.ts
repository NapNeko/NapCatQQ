import {ScalarType} from "@protobuf-ts/runtime";
import {ProtoField} from "../NapProto";

export const OidbSvcTrpcTcp0XFE1_2 = {
    uin: ProtoField(1, ScalarType.UINT32),
    key: ProtoField(3, () => OidbSvcTrpcTcp0XFE1_2Key, false, true),
}

export const OidbSvcTrpcTcp0XFE1_2Key = {
    key: ProtoField(1, ScalarType.UINT32)
}
