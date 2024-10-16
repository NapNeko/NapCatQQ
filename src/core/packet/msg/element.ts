import assert from "node:assert";
import {NapProtoEncodeStructType, NapProtoMsg} from "@/core/packet/proto/NapProto";
import {CustomFace, Elem, MentionExtra, NotOnlineImage} from "@/core/packet/proto/message/element";
import {
    AtType,
    PicType,
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
import {MsgInfo} from "@/core/packet/proto/oidb/common/Ntv2.RichMediaReq";

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
        this.atAll = element.textElement.atType === AtType.atAll;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem> {
        const res = new NapProtoMsg(MentionExtra).encode({
                type: this.atAll ? 1 : 2,
                uin: 0,
                field5: 0,
                uid: this.targetUid,
            }
        );
        return {
            text: {
                str: this.text,
                pbReserve: res
            }
        };
    }
}

export class PacketMsgPicElement extends IPacketMsgElement<SendPicElement> {
    path: string;
    name: string
    size: number;
    md5: string;
    width: number;
    height: number;
    picType: PicType;
    sha1: string | null = null;
    msgInfo: NapProtoEncodeStructType<typeof MsgInfo> | null = null;
    groupPicExt: NapProtoEncodeStructType<typeof CustomFace> | null = null;
    c2cPicExt: NapProtoEncodeStructType<typeof NotOnlineImage> | null = null;

    constructor(element: SendPicElement) {
        super(element);
        this.path = element.picElement.sourcePath;
        this.name = element.picElement.fileName;
        this.size = Number(element.picElement.fileSize);
        this.md5 = element.picElement.md5HexStr ?? '';
        this.width = element.picElement.picWidth;
        this.height = element.picElement.picHeight;
        this.picType = element.picElement.picType;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem> {
        assert(this.msgInfo !== null, 'msgInfo is null, expected not null');
        return {
            commonElem: {
                serviceType: 48,
                pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
                businessType: 10,
            }
        } as NapProtoEncodeStructType<typeof Elem>
    }
}

export class PacketMsgPttElement extends IPacketMsgElement<SendPttElement> {
    constructor(element: SendPttElement) {
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
