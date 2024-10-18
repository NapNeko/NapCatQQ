import {IPacketMsgElement} from "@/core/packet/msg/element";
import {SendMessageElement} from "@/core";

export interface PacketMsg {
    seq?: number;
    clientSeq?: number;
    groupId?: number;
    senderUid: string;
    senderUin: number;
    senderName: string;
    time: number;
    msg: IPacketMsgElement<SendMessageElement>[]
}
