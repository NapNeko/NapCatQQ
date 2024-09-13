import * as pb from 'protobufjs';

// Proto: from src/core/proto/ProfileLike.proto
// Author: Mlikiowa

export interface LikeDetailType {
    txt: string;
    uin: pb.Long;
    nickname: string;
}
export interface LikeMsgType {
    times: number;
    time: number;
    detail: LikeDetailType;
}

export interface profileLikeSubTipType {
    msg: LikeMsgType;
}

export interface ProfileLikeTipType {
    msgType: number;
    subType: number;
    content: profileLikeSubTipType;
}
export interface SysMessageHeaderType {
    id: string;
    timestamp: number;
    sender: string;
}

export interface SysMessageMsgSpecType {
    msgType: number;
    subType: number;
    subSubType: number;
    msgSeq: number;
    time: number;
    msgId: pb.Long;
    other: number;
}
export interface SysMessageBodyWrapperType {
    wrappedBody: Uint8Array;
}
export interface SysMessageType {
    header: SysMessageHeaderType[];
    msgSpec: SysMessageMsgSpecType[];
    bodyWrapper: SysMessageBodyWrapperType;
}

export const SysMessageHeader = new pb.Type("SysMessageHeader")
    .add(new pb.Field("PeerNumber", 1, "uint32"))
    .add(new pb.Field("PeerString", 2, "string"))
    .add(new pb.Field("Uin", 5, "uint32"))
    .add(new pb.Field("Uid", 6, "string", "optional"));

export const SysMessageMsgSpec = new pb.Type("SysMessageMsgSpec")
    .add(new pb.Field("msgType", 1, "uint32"))
    .add(new pb.Field("subType", 2, "uint32"))
    .add(new pb.Field("subSubType", 3, "uint32"))
    .add(new pb.Field("msgSeq", 5, "uint32"))
    .add(new pb.Field("time", 6, "uint32"))
    .add(new pb.Field("msgId", 12, "uint64"))
    .add(new pb.Field("other", 13, "uint32"));

export const SysMessageBodyWrapper = new pb.Type("SysMessageBodyWrapper")
    .add(new pb.Field("wrappedBody", 2, "bytes"));

export const SysMessage = new pb.Type("SysMessage")
    .add(SysMessageHeader)
    .add(SysMessageMsgSpec)
    .add(SysMessageBodyWrapper)
    .add(new pb.Field("header", 1, "SysMessageHeader", "repeated"))
    .add(new pb.Field("msgSpec", 2, "SysMessageMsgSpec", "repeated"))
    .add(new pb.Field("bodyWrapper", 3, "SysMessageBodyWrapper"));

export const likeDetail = new pb.Type("likeDetail")
    .add(new pb.Field("txt", 1, "string"))
    .add(new pb.Field("uin", 3, "int64"))
    .add(new pb.Field("nickname", 5, "string"));

export const likeMsg = new pb.Type("likeMsg")
    .add(likeDetail)
    .add(new pb.Field("times", 1, "int32"))
    .add(new pb.Field("time", 2, "int32"))
    .add(new pb.Field("detail", 3, "likeDetail"));

export const profileLikeSubTip = new pb.Type("profileLikeSubTip")
    .add(likeMsg)
    .add(new pb.Field("msg", 14, "likeMsg"))

export const profileLikeTip = new pb.Type("profileLikeTip")
    .add(profileLikeSubTip)
    .add(new pb.Field("msgType", 1, "int32"))
    .add(new pb.Field("subType", 2, "int32"))
    .add(new pb.Field("content", 203, "profileLikeSubTip"));
