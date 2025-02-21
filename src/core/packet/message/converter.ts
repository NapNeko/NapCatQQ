import {
    ChatType,
    ElementType,
    MessageElement,
    Peer,
    RawMessage,
    SendArkElement,
    SendFaceElement,
    SendFileElement,
    SendMarkdownElement,
    SendMarketFaceElement,
    SendMultiForwardMsgElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    SendTextElement,
    SendVideoElement
} from '@/core';
import {
    IPacketMsgElement,
    PacketMsgAtElement,
    PacketMsgFaceElement,
    PacketMsgFileElement,
    PacketMsgLightAppElement,
    PacketMsgMarkDownElement,
    PacketMsgMarkFaceElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgReplyElement,
    PacketMsgTextElement,
    PacketMsgVideoElement,
    PacketMultiMsgElement
} from '@/core/packet/message/element';
import {PacketMsg, PacketSendMsgElement} from '@/core/packet/message/message';
import {NapProtoDecodeStructType} from '@napneko/nap-proto-core';
import {Elem} from '@/core/packet/transformer/proto';

const SupportedElementTypes = [
    ElementType.TEXT,
    ElementType.PIC,
    ElementType.REPLY,
    ElementType.FACE,
    ElementType.MFACE,
    ElementType.VIDEO,
    ElementType.FILE,
    ElementType.PTT,
    ElementType.ARK,
    ElementType.MARKDOWN,
    ElementType.MULTIFORWARD
];

type SendMessageTypeElementMap = {
    [ElementType.TEXT]: SendTextElement,
    [ElementType.PIC]: SendPicElement,
    [ElementType.FILE]: SendFileElement,
    [ElementType.PTT]: SendPttElement,
    [ElementType.VIDEO]: SendVideoElement,
    [ElementType.FACE]: SendFaceElement,
    [ElementType.REPLY]: SendReplyElement,
    [ElementType.ARK]: SendArkElement,
    [ElementType.MFACE]: SendMarketFaceElement,
    [ElementType.MULTIFORWARD]: SendMultiForwardMsgElement,
    [ElementType.MARKDOWN]: SendMarkdownElement,
};

type ElementToPacketMsgConverters = {
    [K in keyof SendMessageTypeElementMap]: (
        sendElement: MessageElement
    ) => IPacketMsgElement<SendMessageTypeElementMap[K]>;
}

export type rawMsgWithSendMsg = {
    senderUin: number;
    senderUid?: string;
    senderName: string;
    groupId?: number;
    time: number;
    msg: PacketSendMsgElement[]
}

// TODO: make it become adapter?
export class PacketMsgConverter {
    private isValidElementType(type: ElementType): type is keyof ElementToPacketMsgConverters {
        return SupportedElementTypes.includes(type);
    }

    private readonly rawToPacketMsgConverters: ElementToPacketMsgConverters = {
        [ElementType.TEXT]: (element) => {
            if (element.textElement?.atType) {
                return new PacketMsgAtElement(element as SendTextElement);
            }
            return new PacketMsgTextElement(element as SendTextElement);
        },
        [ElementType.PIC]: (element) => {
            return new PacketMsgPicElement(element as SendPicElement);
        },
        [ElementType.REPLY]: (element) => {
            return new PacketMsgReplyElement(element as SendReplyElement);
        },
        [ElementType.FACE]: (element) => {
            return new PacketMsgFaceElement(element as SendFaceElement);
        },
        [ElementType.MFACE]: (element) => {
            return new PacketMsgMarkFaceElement(element as SendMarketFaceElement);
        },
        [ElementType.VIDEO]: (element) => {
            return new PacketMsgVideoElement(element as SendVideoElement);
        },
        [ElementType.FILE]: (element) => {
            return new PacketMsgFileElement(element as SendFileElement);
        },
        [ElementType.PTT]: (element) => {
            return new PacketMsgPttElement(element as SendPttElement);
        },
        [ElementType.ARK]: (element) => {
            return new PacketMsgLightAppElement(element as SendArkElement);
        },
        [ElementType.MARKDOWN]: (element) => {
            return new PacketMsgMarkDownElement(element as SendMarkdownElement);
        },
        [ElementType.MULTIFORWARD]: (element) => {
            return new PacketMultiMsgElement(element as SendMultiForwardMsgElement);
        }
    };

    rawMsgWithSendMsgToPacketMsg(msg: rawMsgWithSendMsg): PacketMsg {
        return {
            senderUid: msg.senderUid ?? '',
            senderUin: msg.senderUin,
            senderName: msg.senderName,
            groupId: msg.groupId,
            time: msg.time,
            msg: msg.msg.map((element) => {
                if (!this.isValidElementType(element.elementType)) return null;
                return this.rawToPacketMsgConverters[element.elementType](element as MessageElement);
            }).filter((e) => e !== null)
        };
    }

    rawMsgToPacketMsg(msg: RawMessage, ctxPeer: Peer): PacketMsg {
        return {
            seq: +msg.msgSeq,
            groupId: ctxPeer.chatType === ChatType.KCHATTYPEGROUP ? +msg.peerUid : undefined,
            senderUid: msg.senderUid,
            senderUin: +msg.senderUin,
            senderName: msg.sendMemberName && msg.sendMemberName !== ''
                ? msg.sendMemberName
                : msg.sendNickName && msg.sendNickName !== ''
                    ? msg.sendNickName
                    : 'QQ用户',
            time: +msg.msgTime,
            msg: msg.elements.map((element) => {
                if (!this.isValidElementType(element.elementType)) return null;
                return this.rawToPacketMsgConverters[element.elementType](element);
            }).filter((e) => e !== null)
        };
    }

    packetMsgToRaw(msg: NapProtoDecodeStructType<typeof Elem>[]): [MessageElement, NapProtoDecodeStructType<typeof Elem> | null][] {
        const converters = [PacketMsgTextElement.parseElement,
            PacketMsgAtElement.parseElement, PacketMsgReplyElement.parseElement, PacketMsgPicElement.parseElement];
        return msg.map((element) => {
            for (const converter of converters) {
                const result = converter(element);
                if (result) return result;
            }
            return null;
        }).filter((e) => e !== null);
    }
}
