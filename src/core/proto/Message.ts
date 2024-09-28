import * as pb from 'protobufjs';


export const BodyInner = new pb.Type("BodyInner")
    .add(new pb.Field("msgType", 1, "uint32", "optional"))
    .add(new pb.Field("subType", 2, "uint32", "optional"))

export const NoifyData = new pb.Type("NoifyData")
    .add(new pb.Field("skip", 1, "bytes", "optional"))
    .add(new pb.Field("innerData", 2, "bytes", "optional"))

export const MsgHead = new pb.Type("MsgHead")
    .add(BodyInner)
    .add(NoifyData)
    .add(new pb.Field("bodyInner", 2, "BodyInner", "optional"))
    .add(new pb.Field("noifyData", 3, "NoifyData", "optional"));

export const Message = new pb.Type("Message")
    .add(MsgHead)
    .add(new pb.Field("msgHead", 1, "MsgHead"))

export const SubDetail = new pb.Type("SubDetail")
    .add(new pb.Field("msgSeq", 1, "uint32"))
    .add(new pb.Field("msgTime", 2, "uint32"))

export const RecallDetails = new pb.Type("RecallDetails")
    .add(SubDetail)
    .add(new pb.Field("operatorUid", 1, "string"))
    .add(new pb.Field("subDetail", 3, "SubDetail"))

export const RecallGroup = new pb.Type("RecallGroup")
    .add(RecallDetails)
    .add(new pb.Field("type", 1, "int32"))
    .add(new pb.Field("peerUid", 4, "uint32"))
    .add(new pb.Field("recallDetails", 11, "RecallDetails"))
    .add(new pb.Field("grayTipsSeq", 37, "uint32"))
