import {
    Peer,
    ChatType,
    ElementType,
    MessageElement,
    RawMessage,
    SendArkElement,
    SendFaceElement,
    SendFileElement,
    SendMarkdownElement,
    SendMarketFaceElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    SendStructLongMsgElement,
    SendTextElement,
    SendVideoElement
} from "@/core";
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
} from "@/core/packet/msg/element";
import {PacketMsg, PacketSendMsgElement} from "@/core/packet/msg/message";
import {LogWrapper} from "@/common/log";

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
    ElementType.STRUCTLONGMSG
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
    [ElementType.STRUCTLONGMSG]: SendStructLongMsgElement,
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

export class PacketMsgConverter {
    private logger: LogWrapper;

    constructor(logger: LogWrapper) {
        this.logger = logger;
    }

    private isValidElementType(type: ElementType): type is keyof ElementToPacketMsgConverters {
        return SupportedElementTypes.includes(type);
    }

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
                    : "QQ用户",
            time: +msg.msgTime,
            msg: msg.elements.map((element) => {
                if (!this.isValidElementType(element.elementType)) return null;
                return this.rawToPacketMsgConverters[element.elementType](element);
            }).filter((e) => e !== null)
        }
    }

    private rawToPacketMsgConverters: ElementToPacketMsgConverters = {
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
        // TODO: check this logic, move it in arkElement?
        [ElementType.STRUCTLONGMSG]: (element) => {
            return new PacketMultiMsgElement(element as SendStructLongMsgElement);
        }
    };
}
