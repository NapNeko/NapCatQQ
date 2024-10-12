import {ProtoField} from "@/core/proto/NapProto";
import {ScalarType} from "@protobuf-ts/runtime";

export const ContentHead = {
    type: ProtoField(1, ScalarType.UINT32),
    subType: ProtoField(2, ScalarType.UINT32, true),
    msgId: ProtoField(4, ScalarType.UINT32),
    sequence: ProtoField(5, ScalarType.UINT32),
    timeStamp: ProtoField(6, ScalarType.UINT32),
    field7: ProtoField(7, ScalarType.UINT64),
}
