import { IPacketMsgElement } from '@/core/packet/message/element';
import {SendMessageElement, SendMultiForwardMsgElement} from '@/core';

export type PacketSendMsgElement = SendMessageElement | SendMultiForwardMsgElement

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
