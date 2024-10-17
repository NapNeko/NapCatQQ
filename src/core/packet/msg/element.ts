import assert from "node:assert";
import * as zlib from "node:zlib";
import {NapProtoEncodeStructType, NapProtoMsg} from "@/core/packet/proto/NapProto";
import {
    CustomFace,
    Elem,
    MarkdownData,
    MentionExtra,
    NotOnlineImage,
    QBigFaceExtra,
    QSmallFaceExtra
} from "@/core/packet/proto/message/element";
import {
    AtType,
    PicType,
    SendArkElement,
    SendFaceElement,
    SendFileElement,
    SendMarkdownElement,
    SendMessageElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    SendStructLongMsgElement,
    SendTextElement,
    SendVideoElement
} from "@/core";
import {MsgInfo} from "@/core/packet/proto/oidb/common/Ntv2.RichMediaReq";

// raw <-> packet
// TODO: check ob11 -> raw impl!
// TODO: parse to raw element
// TODO: SendStructLongMsgElement
export abstract class IPacketMsgElement<T extends SendMessageElement | SendStructLongMsgElement> {
    protected constructor(rawElement: T) {
    }

    buildContent(): Uint8Array | undefined {
        return undefined;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] | undefined {
        return undefined;
    }
}

export class PacketMsgTextElement extends IPacketMsgElement<SendTextElement> {
    text: string;

    constructor(element: SendTextElement) {
        super(element);
        this.text = element.textElement.content;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            text: {
                str: this.text
            }
        }];
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

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            text: {
                str: this.text,
                pbReserve: new NapProtoMsg(MentionExtra).encode({
                        type: this.atAll ? 1 : 2,
                        uin: 0,
                        field5: 0,
                        uid: this.targetUid,
                    }
                )
            }
        }];
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

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        assert(this.msgInfo !== null, 'msgInfo is null, expected not null');
        return [{
            commonElem: {
                serviceType: 48,
                pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
                businessType: 10,
            }
        }]
    }
}

export class PacketMsgReplyElement extends IPacketMsgElement<SendReplyElement> {
    messageId: bigint;
    messageSeq: number;
    messageClientSeq: number;
    targetUin: number;
    targetUid: string;
    time: number;

    constructor(element: SendReplyElement) {
        super(element);
        this.messageId = BigInt(element.replyElement.replayMsgId ?? 0);
        this.messageSeq = Number(element.replyElement.replayMsgSeq ?? 0);
        this.messageClientSeq = Number(element.replyElement.replyMsgClientSeq ?? 0);
        this.targetUin = Number(element.replyElement.senderUin ?? 0);
        this.targetUid = element.replyElement.senderUidStr ?? '';
        this.time = Number(element.replyElement.replyMsgTime ?? 0);
    }

    get isGroupReply(): boolean {
        return this.messageClientSeq !== 0;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            srcMsg: {
                origSeqs: [this.isGroupReply ? this.messageClientSeq : this.messageSeq],
                senderUin: BigInt(this.targetUin),
                time: this.time,
                elems: [], // TODO: in replyElement.sourceMsgTextElems
                pbReserve: {
                    messageId: this.messageId,
                },
                toUin: BigInt(0),
            }
        }, {
            text: this.isGroupReply ? {
                str: 'nya~',
                pbReserve: new NapProtoMsg(MentionExtra).encode({
                    type: this.targetUin === 0 ? 1 : 2,
                    uin: 0,
                    field5: 0,
                    uid: String(this.targetUid),
                }),
            } : undefined,
        }]
    }
}

export class PacketMsgFaceElement extends IPacketMsgElement<SendFaceElement> {
    faceId: number;
    isLargeFace: boolean;

    constructor(element: SendFaceElement) {
        super(element);
        this.faceId = element.faceElement.faceIndex;
        this.isLargeFace = element.faceElement.faceType === 3;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (this.isLargeFace) {
            return [{
                commonElem: {
                    serviceType: 37,
                    pbElem: new NapProtoMsg(QBigFaceExtra).encode({
                        aniStickerPackId: "1",
                        aniStickerId: "8",
                        faceId: this.faceId,
                        field4: 1,
                        field6: "",
                        preview: "",
                        field9: 1
                    }),
                    businessType: 1
                }
            }]
        } else if (this.faceId < 260) {
            return [{
                face: {
                    index: this.faceId
                }
            }];
        } else {
            return [{
                commonElem: {
                    serviceType: 33,
                    pbElem: new NapProtoMsg(QSmallFaceExtra).encode({
                        faceId: this.faceId,
                        preview: "",
                        preview2: ""
                    }),
                    businessType: 1
                }
            }]
        }
    }
}

export class PacketMsgVideoElement extends IPacketMsgElement<SendVideoElement> {
    constructor(element: SendVideoElement) {
        super(element);
    }
}

export class PacketMsgFileElement extends IPacketMsgElement<SendFileElement> {
    constructor(element: SendFileElement) {
        super(element);
    }
}

export class PacketMsgPttElement extends IPacketMsgElement<SendPttElement> {
    constructor(element: SendPttElement) {
        super(element);
    }
}

export class PacketMsgLightAppElement extends IPacketMsgElement<SendArkElement> {
    payload: string;

    constructor(element: SendArkElement) {
        super(element);
        this.payload = element.arkElement.bytesData;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            lightAppElem: {
                data: Buffer.concat([
                    Buffer.from([0x01]),
                    zlib.deflateSync(Buffer.from(this.payload, 'utf-8'))
                ])
            }
        }]
    }
}

export class PacketMsgMarkDownElement extends IPacketMsgElement<SendMarkdownElement> {
    content: string;

    constructor(element: SendMarkdownElement) {
        super(element);
        this.content = element.markdownElement.content;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            commonElem: {
                serviceType: 45,
                pbElem: new NapProtoMsg(MarkdownData).encode({
                    content: this.content
                }),
                businessType: 1
            }
        }]
    }
}

// TODO:
// export class PacketMsgLongMsgElement extends IPacketMsgElement<SendStructLongMsgElement> {
//     resid: string;
//
//     constructor(element: SendStructLongMsgElement) {
//         super(element);
//         this.resid = element.structLongMsgElement.resId;
//     }
//
//     buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
//         return [{
//             generalFlags: {
//                 longTextResId: this.resid,
//                 longTextFlag: 1
//             }
//         }]
//     }
// }
