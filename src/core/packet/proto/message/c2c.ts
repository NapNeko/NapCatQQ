import { ScalarType } from "@protobuf-ts/runtime";
import { ProtoField } from "../NapProto";

export const C2C = {
    uin: ProtoField(1, ScalarType.UINT32, true),
    uid: ProtoField(2, ScalarType.STRING, true),
    field3: ProtoField(3, ScalarType.UINT32, true),
    sig: ProtoField(4, ScalarType.UINT32, true),
    receiverUin: ProtoField(5, ScalarType.UINT32, true),
    receiverUid: ProtoField(6, ScalarType.STRING, true),
};
