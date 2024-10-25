import * as zlib from "node:zlib";
import { NapProtoEncodeStructType, NapProtoMsg } from "@/core/packet/proto/NapProto";
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
    SendMarketFaceElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    SendStructLongMsgElement,
    SendTextElement,
    SendVideoElement
} from "@/core";
import { MsgInfo } from "@/core/packet/proto/oidb/common/Ntv2.RichMediaReq";
import { PacketMsg, PacketSendMsgElement } from "@/core/packet/msg/message";
import { ForwardMsgBuilder } from "@/common/forward-msg-builder";
import { FileExtra, GroupFileExtra } from "@/core/packet/proto/message/component";
import { OidbSvcTrpcTcp0XE37_800Response } from "@/core/packet/proto/oidb/Oidb.0XE37_800";

// raw <-> packet
// TODO: SendStructLongMsgElement
export abstract class IPacketMsgElement<T extends PacketSendMsgElement> {
    protected constructor(rawElement: T) {
    }

    get valid(): boolean {
        return true;
    }

    buildContent(): Uint8Array | undefined {
        return undefined;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [];
    }

    toPreview(): string {
        return '[暂不支持该消息类型喵~]';
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

    toPreview(): string {
        return this.text;
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

export class PacketMsgReplyElement extends IPacketMsgElement<SendReplyElement> {
    messageId: bigint;
    messageSeq: number;
    messageClientSeq: number;
    targetUin: number;
    targetUid: string;
    time: number;
    elems: PacketMsg[];

    constructor(element: SendReplyElement) {
        super(element);
        this.messageId = BigInt(element.replyElement.replayMsgId ?? 0);
        this.messageSeq = +(element.replyElement.replayMsgSeq ?? 0);
        this.messageClientSeq = +(element.replyElement.replyMsgClientSeq ?? 0);
        this.targetUin = +(element.replyElement.senderUin ?? 0);
        this.targetUid = element.replyElement.senderUidStr ?? '';
        this.time = +(element.replyElement.replyMsgTime ?? 0);
        this.elems = []; // TODO: in replyElement.sourceMsgTextElems
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
        }];
    }

    toPreview(): string {
        return "[回复消息]";
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
            }];
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
            }];
        }
    }

    toPreview(): string {
        return "[表情]";
    }
}

export class PacketMsgMarkFaceElement extends IPacketMsgElement<SendMarketFaceElement> {
    emojiName: string;
    emojiId: string;
    emojiPackageId: number;
    emojiKey: string;

    constructor(element: SendMarketFaceElement) {
        super(element);
        this.emojiName = element.marketFaceElement.faceName;
        this.emojiId = element.marketFaceElement.emojiId;
        this.emojiPackageId = element.marketFaceElement.emojiPackageId;
        this.emojiKey = element.marketFaceElement.key;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            marketFace: {
                faceName: this.emojiName,
                itemType: 6,
                faceInfo: 1,
                faceId: Buffer.from(this.emojiId, 'hex'),
                tabId: this.emojiPackageId,
                subType: 3,
                key: this.emojiKey,
                imageWidth: 300,
                imageHeight: 300,
                pbReserve: {
                    field8: 1
                }
            }
        }];
    }

    toPreview(): string {
        return `[${this.emojiName}]`;
    }
}

export class PacketMsgPicElement extends IPacketMsgElement<SendPicElement> {
    path: string;
    name: string;
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
        this.size = +element.picElement.fileSize;
        this.md5 = element.picElement.md5HexStr ?? '';
        this.width = element.picElement.picWidth;
        this.height = element.picElement.picHeight;
        this.picType = element.picElement.picType;
    }

    get valid(): boolean {
        return !!this.msgInfo;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (!this.msgInfo) return [];
        return [{
            commonElem: {
                serviceType: 48,
                pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
                businessType: 10,
            }
        }];
    }

    toPreview(): string {
        return "[图片]";
    }
}

export class PacketMsgVideoElement extends IPacketMsgElement<SendVideoElement> {
    fileSize?: string;
    filePath?: string;
    thumbSize?: number;
    thumbPath?: string;
    fileMd5?: string;
    fileSha1?: string;
    thumbMd5?: string;
    thumbSha1?: string;
    thumbWidth?: number;
    thumbHeight?: number;
    msgInfo: NapProtoEncodeStructType<typeof MsgInfo> | null = null;

    constructor(element: SendVideoElement) {
        super(element);
        this.fileSize = element.videoElement.fileSize;
        this.filePath = element.videoElement.filePath;
        this.thumbSize = element.videoElement.thumbSize;
        this.thumbPath = element.videoElement.thumbPath?.get(0);
        this.fileMd5 = element.videoElement.videoMd5
        this.thumbMd5 = element.videoElement.thumbMd5;
        this.thumbWidth = element.videoElement.thumbWidth;
        this.thumbHeight = element.videoElement.thumbHeight;
    }

    get valid(): boolean {
        return !!this.msgInfo;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (!this.msgInfo) return [];
        return [{
            commonElem: {
                serviceType: 48,
                pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
                businessType: 21,
            }
        }];
    }

    toPreview(): string {
        return "[视频]";
    }
}

export class PacketMsgPttElement extends IPacketMsgElement<SendPttElement> {
    filePath: string;
    fileSize: number;
    fileMd5: string;
    fileSha1?: string;
    fileDuration: number;
    msgInfo: NapProtoEncodeStructType<typeof MsgInfo> | null = null;

    constructor(element: SendPttElement) {
        super(element);
        this.filePath = element.pttElement.filePath;
        this.fileSize = +element.pttElement.fileSize; // TODO: cc
        this.fileMd5 = element.pttElement.md5HexStr;
        this.fileDuration = Math.round(element.pttElement.duration); // TODO: cc
    }

    get valid(): boolean {
        return false;
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return []
        // if (!this.msgInfo) return [];
        // return [{
        //     commonElem: {
        //         serviceType: 48,
        //         pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
        //         businessType: 22,
        //     }
        // }];
    }

    toPreview(): string {
        return "[语音]";
    }
}

export class PacketMsgFileElement extends IPacketMsgElement<SendFileElement> {
    fileName: string;
    filePath: string;
    fileSize: number;
    fileSha1?: Uint8Array;
    fileMd5?: Uint8Array;
    fileUuid?: string;
    fileHash?: string;
    isGroupFile?: boolean;
    _private_send_uid?: string;
    _private_recv_uid?: string;
    _e37_800_rsp?: NapProtoEncodeStructType<typeof OidbSvcTrpcTcp0XE37_800Response>

    constructor(element: SendFileElement) {
        super(element);
        this.fileName = element.fileElement.fileName;
        this.filePath = element.fileElement.filePath;
        this.fileSize = +element.fileElement.fileSize;
    }

    get valid(): boolean {
        return this.isGroupFile || Boolean(this._e37_800_rsp);
    }

    buildContent(): Uint8Array | undefined {
        if (this.isGroupFile || !this._e37_800_rsp) return undefined;
        return new NapProtoMsg(FileExtra).encode({
            file: {
                fileType: 0,
                fileUuid: this.fileUuid,
                fileMd5: this.fileMd5,
                fileName: this.fileName,
                fileSize: BigInt(this.fileSize),
                subcmd: 1,
                dangerEvel: 0,
                expireTime: Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
                fileHash: this.fileHash,
            },
            field6: {
                field2: {
                    field1: this._e37_800_rsp?.body?.field30?.field110,
                    fileUuid: this.fileUuid,
                    fileName: this.fileName,
                    field6: this._e37_800_rsp?.body?.field30?.field3,
                    field7: this._e37_800_rsp?.body?.field30?.field101,
                    field8: this._e37_800_rsp?.body?.field30?.field100,
                    timestamp1: this._e37_800_rsp?.body?.field30?.timestamp1,
                    fileHash: this.fileHash,
                    selfUid: this._private_send_uid,
                    destUid: this._private_recv_uid,
                }
            }
        })
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (!this.isGroupFile) return [];
        const lb = Buffer.alloc(2);
        const transElemVal = new NapProtoMsg(GroupFileExtra).encode({
            field1: 6,
            fileName: this.fileName,
            inner: {
                info: {
                    busId: 102,
                    fileId: this.fileUuid,
                    fileSize: BigInt(this.fileSize),
                    fileName: this.fileName,
                    fileSha: this.fileSha1,
                    extInfoString: "",
                    fileMd5: this.fileMd5,
                }
            }
        })
        lb.writeUInt16BE(transElemVal.length);
        return [{
            transElem: {
                elemType: 24,
                elemValue: Buffer.concat([Buffer.from([0x01]), lb, transElemVal]) // TLV
            }
        }];
    }

    toPreview(): string {
        return `[文件]${this.fileName}`;
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
        }];
    }

    toPreview(): string {
        return "[卡片消息]";
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
        }];
    }

    toPreview(): string {
        return `[Markdown消息 ${this.content}]`;
    }
}

export class PacketMultiMsgElement extends IPacketMsgElement<SendStructLongMsgElement> {
    resid: string;
    message: PacketMsg[];

    constructor(rawElement: SendStructLongMsgElement, message?: PacketMsg[]) {
        super(rawElement);
        this.resid = rawElement.structLongMsgElement.resId;
        this.message = message ?? [];
    }

    buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            lightAppElem: {
                data: Buffer.concat([
                    Buffer.from([0x01]),
                    zlib.deflateSync(Buffer.from(JSON.stringify(ForwardMsgBuilder.fromPacketMsg(this.resid, this.message)), 'utf-8'))
                ])
            }
        }];
    }

    toPreview(): string {
        return "[聊天记录]";
    }
}
