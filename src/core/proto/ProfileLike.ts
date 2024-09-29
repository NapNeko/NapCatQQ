import { MessageType, BinaryReader, ScalarType, RepeatType } from '@protobuf-ts/runtime';

export const LikeDetailType = new MessageType("LikeDetailType", [
    { no: 1, name: "txt", kind: "scalar", T: ScalarType.STRING /* string */ },
    { no: 2, name: "uin", kind: "scalar", T: ScalarType.INT64 /* int64 */ },
    { no: 3, name: "nickname", kind: "scalar", T: ScalarType.STRING /* string */ }
]);

export const LikeMsgType = new MessageType("LikeMsgType", [
    { no: 1, name: "times", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 2, name: "time", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 3, name: "detail", kind: "message", T: () => LikeDetailType }
]);

export const ProfileLikeSubTipType = new MessageType("ProfileLikeSubTipType", [
    { no: 1, name: "msg", kind: "message", T: () => LikeMsgType }
]);

export const ProfileLikeTipType = new MessageType("ProfileLikeTipType", [
    { no: 1, name: "msgType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 2, name: "subType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 3, name: "content", kind: "message", T: () => ProfileLikeSubTipType }
]);

export const SysMessageHeaderType = new MessageType("SysMessageHeaderType", [
    { no: 1, name: "id", kind: "scalar", T: ScalarType.STRING /* string */ },
    { no: 2, name: "timestamp", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 3, name: "sender", kind: "scalar", T: ScalarType.STRING /* string */ }
]);

export const SysMessageMsgSpecType = new MessageType("SysMessageMsgSpecType", [
    { no: 1, name: "msgType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 2, name: "subType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 3, name: "subSubType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 4, name: "msgSeq", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 5, name: "time", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 6, name: "msgId", kind: "scalar", T: ScalarType.INT64 /* int64 */ },
    { no: 7, name: "other", kind: "scalar", T: ScalarType.INT32 /* int32 */ }
]);

export const SysMessageBodyWrapperType = new MessageType("SysMessageBodyWrapperType", [
    { no: 1, name: "wrappedBody", kind: "scalar", T: ScalarType.BYTES /* bytes */ }
]);

export const SysMessageType = new MessageType("SysMessageType", [
    { no: 1, name: "header", kind: "message", T: () => SysMessageHeaderType, repeat: RepeatType.PACKED },
    { no: 2, name: "msgSpec", kind: "message", T: () => SysMessageMsgSpecType, repeat: RepeatType.PACKED },
    { no: 3, name: "bodyWrapper", kind: "message", T: () => SysMessageBodyWrapperType }
]);

export function decodeProfileLikeTip(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return ProfileLikeTipType.internalBinaryRead(reader, reader.len, { readUnknownField: true, readerFactory: () => new BinaryReader(buffer) });
}

export function decodeSysMessage(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return SysMessageType.internalBinaryRead(reader, reader.len, { readUnknownField: true, readerFactory: () => new BinaryReader(buffer) });
}