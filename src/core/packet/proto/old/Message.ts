// TODO: refactor with NapProto
import { MessageType, BinaryReader, ScalarType } from '@protobuf-ts/runtime';

export const BodyInner = new MessageType("BodyInner", [
    { no: 1, name: "msgType", kind: "scalar", T: ScalarType.UINT32 /* uint32 */, opt: true },
    { no: 2, name: "subType", kind: "scalar", T: ScalarType.UINT32 /* uint32 */, opt: true }
]);

export const NoifyData = new MessageType("NoifyData", [
    { no: 1, name: "skip", kind: "scalar", T: ScalarType.BYTES /* bytes */, opt: true },
    { no: 2, name: "innerData", kind: "scalar", T: ScalarType.BYTES /* bytes */, opt: true }
]);

export const MsgHead = new MessageType("MsgHead", [
    { no: 2, name: "bodyInner", kind: "message", T: () => BodyInner, opt: true },
    { no: 3, name: "noifyData", kind: "message", T: () => NoifyData, opt: true }
]);

export const Message = new MessageType("Message", [
    { no: 1, name: "msgHead", kind: "message", T: () => MsgHead }
]);

export const SubDetail = new MessageType("SubDetail", [
    { no: 1, name: "msgSeq", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 2, name: "msgTime", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 6, name: "senderUid", kind: "scalar", T: ScalarType.STRING /* string */ }
]);

export const RecallDetails = new MessageType("RecallDetails", [
    { no: 1, name: "operatorUid", kind: "scalar", T: ScalarType.STRING /* string */ },
    { no: 3, name: "subDetail", kind: "message", T: () => SubDetail }
]);

export const RecallGroup = new MessageType("RecallGroup", [
    { no: 1, name: "type", kind: "scalar", T: ScalarType.INT32 /* int32 */ },
    { no: 4, name: "peerUid", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ },
    { no: 11, name: "recallDetails", kind: "message", T: () => RecallDetails },
    { no: 37, name: "grayTipsSeq", kind: "scalar", T: ScalarType.UINT32 /* uint32 */ }
]);

export function decodeMessage(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return Message.internalBinaryRead(reader, reader.len, { readUnknownField: true, readerFactory: () => new BinaryReader(buffer) });
}

export function decodeRecallGroup(buffer: Uint8Array): any {
    const reader = new BinaryReader(buffer);
    return RecallGroup.internalBinaryRead(reader, reader.len, { readUnknownField: true, readerFactory: () => new BinaryReader(buffer) });
}
