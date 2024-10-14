import {NapProtoEncodeStructType, NapProtoMsg} from "@/core/packet/proto/NapProto";
import {Elem, MentionExtra} from "@/core/packet/proto/message/element";
import {
    AtType,
    SendArkElement,
    SendFaceElement,
    SendFileElement,
    SendMessageElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    SendTextElement,
    SendVideoElement
} from "@/core";

// raw <-> packet
// TODO: check ob11 -> raw impl!
// TODO: parse to raw element
export abstract class IPacketMsgElement<T extends SendMessageElement> {
    protected constructor(rawElement: T) {
    }

    buildContent(): Uint8Array | undefined {
        return undefined;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem> | undefined {
        return undefined;
    }
}

export class PacketMsgTextElement extends IPacketMsgElement<SendTextElement> {
    text: string;

    constructor(element: SendTextElement) {
        super(element);
        console.log(JSON.stringify(element));
        this.text = element.textElement.content;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem> {
        return {
            text: {
                str: this.text
            }
        };
    }
}

export class PacketMsgAtElement extends PacketMsgTextElement {
    targetUid: string;
    atAll: boolean;

    constructor(element: SendTextElement) {
        super(element);
        this.targetUid = element.textElement.atNtUid;
        this.atAll = element.textElement.atType === AtType.atAll
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem> {
        const res = new NapProtoMsg(MentionExtra).encode({
                type: this.atAll ? 1 : 2,
                uin: 0,
                field5: 0,
                uid: this.targetUid,
            }
        )
        return {
            text: {
                str: this.text,
                pbReserve: res
            }
        }
    }
}

export class PacketMsgPttElement extends IPacketMsgElement<SendPttElement> {
    constructor(element: SendPttElement) {
        super(element);
    }
}

export class PacketMsgPicElement extends IPacketMsgElement<SendPicElement> {
    constructor(element: SendPicElement) {
        super(element);
    }
}

export class PacketMsgReplyElement extends IPacketMsgElement<SendReplyElement> {
    constructor(element: SendReplyElement) {
        super(element);
    }
}

export class PacketMsgFaceElement extends IPacketMsgElement<SendFaceElement> {
    constructor(element: SendFaceElement) {
        super(element);
    }
}

export class PacketMsgFileElement extends IPacketMsgElement<SendFileElement> {
    constructor(element: SendFileElement) {
        super(element);
    }
}

export class PacketMsgVideoElement extends IPacketMsgElement<SendVideoElement> {
    constructor(element: SendVideoElement) {
        super(element);
    }
}

export class PacketMsgLightAppElement extends IPacketMsgElement<SendArkElement> {
    constructor(element: SendArkElement) {
        super(element);
    }
}
