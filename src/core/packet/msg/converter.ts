import {
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
import { PacketMsg, PacketSendMsgElement } from "@/core/packet/msg/message";
import { LogWrapper } from "@/common/log";

type SendMessageElementMap = {
    textElement: SendTextElement,
    picElement: SendPicElement,
    replyElement: SendReplyElement,
    faceElement: SendFaceElement,
    marketFaceElement: SendMarketFaceElement,
    videoElement: SendVideoElement,
    fileElement: SendFileElement,
    pttElement: SendPttElement,
    arkElement: SendArkElement,
    markdownElement: SendMarkdownElement,
    structLongMsgElement: SendStructLongMsgElement
};

type RawToPacketMsgConverters = {
    [K in keyof SendMessageElementMap]: (
        element: SendMessageElementMap[K],
        msg?: RawMessage,
        elementWrapper?: MessageElement,
    ) => IPacketMsgElement<SendMessageElementMap[K]> | null;
};

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

    rawMsgWithSendMsgToPacketMsg(msg: rawMsgWithSendMsg): PacketMsg {
        return {
            senderUid: msg.senderUid ?? '',
            senderUin: msg.senderUin,
            senderName: msg.senderName,
            groupId: msg.groupId,
            time: msg.time,
            msg: msg.msg.map((element) => {
                const key = (Object.keys(this.rawToPacketMsgConverters) as Array<keyof SendMessageElementMap>).find(
                    (k) => (element as any)[k] !== undefined  // TODO:
                );
                if (key) {
                    const elementData = (element as any)[key];  // TODO:
                    if (elementData) return this.rawToPacketMsgConverters[key](element as any);
                }
                return null;
            }).filter((e) => e !== null)
        };
    }

    private rawToPacketMsgConverters: RawToPacketMsgConverters = {
        textElement: (element: SendTextElement) => {
            if (element.textElement.atType) {
                return new PacketMsgAtElement(element);
            }
            return new PacketMsgTextElement(element);
        },
        picElement: (element: SendPicElement) => {
            return new PacketMsgPicElement(element);
        },
        replyElement: (element: SendReplyElement) => {
            return new PacketMsgReplyElement(element);
        },
        faceElement: (element: SendFaceElement) => {
            return new PacketMsgFaceElement(element);
        },
        marketFaceElement: (element: SendMarketFaceElement) => {
            return new PacketMsgMarkFaceElement(element);
        },
        videoElement: (element: SendVideoElement) => {
            return new PacketMsgVideoElement(element);
        },
        fileElement: (element: SendFileElement) => {
            return new PacketMsgFileElement(element);
        },
        pttElement: (element: SendPttElement) => {
            return new PacketMsgPttElement(element);
        },
        arkElement: (element: SendArkElement) => {
            return new PacketMsgLightAppElement(element);
        },
        markdownElement: (element: SendMarkdownElement) => {
            return new PacketMsgMarkDownElement(element);
        },
        // TODO: check this logic, move it in arkElement?
        structLongMsgElement: (element: SendStructLongMsgElement) => {
            return new PacketMultiMsgElement(element);
        }
    };
}
