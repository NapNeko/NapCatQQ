import { IPacketMsgElement } from "@/core/packet/msg/element";
import { SendMessageElement, SendStructLongMsgElement } from "@/core";

export type PacketSendMsgElement = SendMessageElement | SendStructLongMsgElement

export interface PacketMsg {
    seq?: number;
    clientSeq?: number;
    groupId?: number;
    senderUid: string;
    senderUin: number;
    senderName: string;
    time: number;
    msg: IPacketMsgElement<PacketSendMsgElement>[]
}
