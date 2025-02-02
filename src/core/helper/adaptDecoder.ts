// TODO: further refactor in NapCat.Packet v2
import { NapProtoMsg, ProtoField, ScalarType } from '@napneko/nap-proto-core';

const LikeDetail = {
    txt: ProtoField(1, ScalarType.STRING),
    uin: ProtoField(3, ScalarType.INT64),
    nickname: ProtoField(5, ScalarType.STRING)
};

const LikeMsg = {
    times: ProtoField(1, ScalarType.INT32),
    time: ProtoField(2, ScalarType.INT32),
    detail: ProtoField(3, () => LikeDetail)
};

const ProfileLikeSubTip = {
    msg: ProtoField(14, () => LikeMsg)
};

const ProfileLikeTip = {
    msgType: ProtoField(1, ScalarType.INT32),
    subType: ProtoField(2, ScalarType.INT32),
    content: ProtoField(203, () => ProfileLikeSubTip)
};

const SysMessageHeader = {
    PeerNumber: ProtoField(1, ScalarType.UINT32),
    PeerString: ProtoField(2, ScalarType.STRING),
    Uin: ProtoField(5, ScalarType.UINT32),
    Uid: ProtoField(6, ScalarType.STRING, true)
};

const SysMessageMsgSpec = {
    msgType: ProtoField(1, ScalarType.UINT32),
    subType: ProtoField(2, ScalarType.UINT32),
    subSubType: ProtoField(3, ScalarType.UINT32),
    msgSeq: ProtoField(5, ScalarType.UINT32),
    time: ProtoField(6, ScalarType.UINT32),
    msgId: ProtoField(12, ScalarType.UINT64),
    other: ProtoField(13, ScalarType.UINT32)
};

const SysMessageBodyWrapper = {
    wrappedBody: ProtoField(2, ScalarType.BYTES)
};

const SysMessage = {
    header: ProtoField(1, () => SysMessageHeader, false, true),
    msgSpec: ProtoField(2, () => SysMessageMsgSpec, false, true),
    bodyWrapper: ProtoField(3, () => SysMessageBodyWrapper)
};

export function decodeProfileLikeTip(buffer: Uint8Array) {
    const msg = new NapProtoMsg(ProfileLikeTip);
    return msg.decode(buffer);
}

export function decodeSysMessage(buffer: Uint8Array) {
    const msg = new NapProtoMsg(SysMessage);
    return msg.decode(buffer);
}
