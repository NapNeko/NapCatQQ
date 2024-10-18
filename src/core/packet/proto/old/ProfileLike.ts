// TODO: refactor with NapProto
import { MessageType, BinaryReader, ScalarType, RepeatType } from '@protobuf-ts/runtime';

export const LikeDetail = new MessageType("likeDetail", [
    { no: 1, name: "txt", kind: "scalar", T: ScalarType.STRING /* string */ },
    { no: 3, name: "uin", kind: "scalar", T: ScalarType.INT64 /* int64 */ },
    { no: 5, name: "nickname", kind: "scalar", T: ScalarType.STRING /* string */ }
]);

export const LikeMsg = new MessageType("likeMsg", [
    { no: 1, name: "times", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 2, name: "time", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 3, name: "detail", kind: "message", T: () => LikeDetail }
]);

export const ProfileLikeSubTip = new MessageType("profileLikeSubTip", [
    { no: 14, name: "msg", kind: "message", T: () => LikeMsg }
]);
export const ProfileLikeTip = new MessageType("profileLikeTip", [
    { no: 1, name: "msgType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 2, name: "subType", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 203, name: "content", kind: "message", T: () => ProfileLikeSubTip }
]);
export const SysMessageHeader = new MessageType("SysMessageHeader", [
    { no: 1, name: "PeerNumber", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 2, name: "PeerString", kind: "scalar", T: ScalarType.STRING /* string */ },
    { no: 5, name: "Uin", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 6, name: "Uid", kind: "scalar", T: ScalarType.STRING /* string */, opt: true }
]);

export const SysMessageMsgSpec = new MessageType("SysMessageMsgSpec", [
    { no: 1, name: "msgType", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 2, name: "subType", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 3, name: "subSubType", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 5, name: "msgSeq", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 6, name: "time", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 12, name: "msgId", kind: "scalar", T: ScalarType.UINT64 /* uint64 */ },
    { no: 13, name: "other", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ }
]);

export const SysMessageBodyWrapper = new MessageType("SysMessageBodyWrapper", [
    { no: 2, name: "wrappedBody", kind: "scalar", T: ScalarType.BYTES /* bytes */ }
]);

export const SysMessage = new MessageType("SysMessage", [
    { no: 1, name: "header", kind: "message", T: () => SysMessageHeader, repeat: RepeatType.UNPACKED },
    { no: 2, name: "msgSpec", kind: "message", T: () => SysMessageMsgSpec, repeat: RepeatType.UNPACKED },
    { no: 3, name: "bodyWrapper", kind: "message", T: () => SysMessageBodyWrapper }
]);

export function decodeProfileLikeTip(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return ProfileLikeTip.internalBinaryRead(reader, reader.len, { readUnknownField: true, readerFactory: () => new BinaryReader(buffer) });
}

export function decodeSysMessage(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return SysMessage.internalBinaryRead(reader, reader.len, { readUnknownField: true, readerFactory: () => new BinaryReader(buffer) });
}
