import {IPacketMsgElement} from "@/core/packet/msg/element";
import {SendMessageElement} from "@/core";

export interface PacketForwardNode {
    groupId?: number
    senderId: number
    senderName: string
    time: number
    msg: IPacketMsgElement<SendMessageElement>[]
}
