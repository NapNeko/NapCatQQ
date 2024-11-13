// TODO: further refactor in NapCat.Packet v2
import { NapProtoMsg, ProtoField, ScalarType } from "@napneko/nap-proto-core";

const BodyInner = {
    msgType: ProtoField(1, ScalarType.UINT32, true),
    subType: ProtoField(2, ScalarType.UINT32, true)
};

const NoifyData = {
    skip: ProtoField(1, ScalarType.BYTES, true),
    innerData: ProtoField(2, ScalarType.BYTES, true)
};

const MsgHead = {
    bodyInner: ProtoField(2, () => BodyInner, true),
    noifyData: ProtoField(3, () => NoifyData, true)
};

const Message = {
    msgHead: ProtoField(1, () => MsgHead)
};

const SubDetail = {
    msgSeq: ProtoField(1, ScalarType.UINT32),
    msgTime: ProtoField(2, ScalarType.UINT32),
    senderUid: ProtoField(6, ScalarType.STRING)
};

const RecallDetails = {
    operatorUid: ProtoField(1, ScalarType.STRING),
    subDetail: ProtoField(3, () => SubDetail)
};

const RecallGroup = {
    type: ProtoField(1, ScalarType.INT32),
    peerUid: ProtoField(4, ScalarType.UINT32),
    recallDetails: ProtoField(11, () => RecallDetails),
    grayTipsSeq: ProtoField(37, ScalarType.UINT32)
};

export function decodeMessage(buffer: Uint8Array) {
    const msg = new NapProtoMsg(Message);
    return msg.decode(buffer);
}

export function decodeRecallGroup(buffer: Uint8Array){
    const msg = new NapProtoMsg(RecallGroup);
    return msg.decode(buffer);
}
