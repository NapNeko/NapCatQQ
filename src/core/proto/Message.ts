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

export const RecallGroup = new pb.Type("RecallGroup")
    .add(new pb.Field("msgSeq", 37, "uint32"))
