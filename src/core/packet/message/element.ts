import * as zlib from 'node:zlib';
import {NapProtoDecodeStructType, NapProtoEncodeStructType, NapProtoMsg} from '@napneko/nap-proto-core';
import {
    CustomFace,
    Elem,
    FileExtra,
    GroupFileExtra,
    MarkdownData,
    MentionExtra,
    MsgInfo,
    NotOnlineImage,
    OidbSvcTrpcTcp0XE37_800Response,
    PushMsgBody,
    QBigFaceExtra,
    QSmallFaceExtra,
} from '@/core/packet/transformer/proto';
import {
    ElementType,
    FaceType,
    MessageElement,
    NTMsgAtType,
    PicType,
    SendArkElement,
    SendFaceElement,
    SendFileElement,
    SendMarkdownElement,
    SendMarketFaceElement,
    SendPicElement,
    SendPttElement,
    SendReplyElement,
    SendMultiForwardMsgElement,
    SendTextElement,
    SendVideoElement,
    Peer
} from '@/core';
import {ForwardMsgBuilder} from '@/common/forward-msg-builder';
import {PacketMsg, PacketSendMsgElement} from '@/core/packet/message/message';

export type ParseElementFnR = [MessageElement, NapProtoDecodeStructType<typeof Elem> | null] | undefined;
type ParseElementFn = (elem: NapProtoDecodeStructType<typeof Elem>) => ParseElementFnR;

// raw <-> packet
// TODO: SendStructLongMsgElement
export abstract class IPacketMsgElement<T extends PacketSendMsgElement> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    protected constructor(_rawElement: T) {
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

    static parseElement: ParseElementFn;

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

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            text: {
                str: this.text
            }
        }];
    }

    static override parseElement = (elem: NapProtoDecodeStructType<typeof Elem>): ParseElementFnR => {
        if (elem.text?.str && (elem.text?.attr6Buf === undefined || elem.text?.attr6Buf?.length === 0)) {
            return [{
                textElement: {
                    content: elem.text?.str,
                    atType: NTMsgAtType.ATTYPEUNKNOWN,
                    atUid: '',
                    atTinyId: '',
                    atNtUid: '',
                },
                elementType: ElementType.UNKNOWN,
                elementId: '',
            }, null];
        }
        return undefined;
    };

    override toPreview(): string {
        return this.text;
    };
}



export class PacketMsgAtElement extends PacketMsgTextElement {
    targetUid: string;
    atAll: boolean;

    constructor(element: SendTextElement) {
        super(element);
        this.targetUid = element.textElement.atNtUid;
        this.atAll = element.textElement.atType === NTMsgAtType.ATTYPEALL;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
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
    static override parseElement = (elem: NapProtoDecodeStructType<typeof Elem>): ParseElementFnR => {
        if (elem.text?.str && (elem.text?.attr6Buf?.length ?? 100) >= 11) {
            return [{
                textElement: {
                    content: elem.text?.str,
                    atType: NTMsgAtType.ATTYPEONE,
                    atUid: String(Buffer.from(elem.text!.attr6Buf!).readUInt32BE(7)),  // FIXME: hack
                    atTinyId: '',
                    atNtUid: '',
                },
                elementType: ElementType.UNKNOWN,
                elementId: '',
            }, null];
        }
        return undefined;
    };
}

export class PacketMsgReplyElement extends IPacketMsgElement<SendReplyElement> {
    time: number;
    targetMessageId: bigint;
    targetMessageSeq: number;
    targetMessageClientSeq: number;
    targetUin: number;
    targetUid: string;
    targetElems?: NapProtoEncodeStructType<typeof Elem>[];
    targetSourceMsg?: NapProtoEncodeStructType<typeof PushMsgBody>;
    targetPeer?: Peer;

    constructor(element: SendReplyElement) {
        super(element);
        this.time = +(element.replyElement.replyMsgTime ?? Math.floor(Date.now() / 1000));
        this.targetMessageId = BigInt(element.replyElement.replayMsgId ?? 0);
        this.targetMessageSeq = +(element.replyElement.replayMsgSeq ?? 0);
        this.targetMessageClientSeq = +(element.replyElement.replyMsgClientSeq ?? 0);
        this.targetUin = +(element.replyElement.senderUin ?? 0);
        this.targetUid = element.replyElement.senderUidStr ?? '';
        this.targetPeer = element.replyElement._replyMsgPeer;
    }

    get isGroupReply(): boolean {
        return this.targetMessageClientSeq === 0;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            srcMsg: {
                origSeqs: [this.isGroupReply ? this.targetMessageSeq : this.targetMessageClientSeq],
                senderUin: BigInt(this.targetUin),
                time: this.time,
                elems: this.targetElems ?? [],
                sourceMsg: new NapProtoMsg(PushMsgBody).encode(this.targetSourceMsg ?? {}),
                toUin: BigInt(0),
            }
        }];
    }

    static override parseElement = (elem: NapProtoDecodeStructType<typeof Elem>): ParseElementFnR => {
        if (elem.srcMsg && elem.srcMsg.pbReserve) {
            const reserve = elem.srcMsg.pbReserve;
            return [{
                replyElement: {
                    replayMsgSeq: String(reserve.friendSeq ?? elem.srcMsg?.origSeqs?.[0] ?? 0),
                    replayMsgId: String(reserve.messageId ?? 0),
                    senderUin: String(elem?.srcMsg ?? 0)
                },
                elementType: ElementType.UNKNOWN,
                elementId: '',
            }, null];
        }
        return undefined;
    };

    override toPreview(): string {
        return '[回复消息]';
    }
}

export class PacketMsgFaceElement extends IPacketMsgElement<SendFaceElement> {
    faceId: number;
    isLargeFace: boolean;
    resultId?: string;

    constructor(element: SendFaceElement) {
        super(element);
        this.faceId = element.faceElement.faceIndex;
        this.resultId = element.faceElement.resultId;
        this.isLargeFace = element.faceElement.faceType === FaceType.AniSticke;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (this.isLargeFace) {
            return [{
                commonElem: {
                    serviceType: 37,
                    pbElem: new NapProtoMsg(QBigFaceExtra).encode({
                        aniStickerPackId: '1',
                        aniStickerId: '8',
                        faceId: this.faceId,
                        sourceType: 1,
                        resultId: this.resultId,
                        preview: '',
                        randomType: 1
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
                        preview: '',
                        preview2: ''
                    }),
                    businessType: 1
                }
            }];
        }
    }

    static override parseElement = (elem: NapProtoDecodeStructType<typeof Elem>): ParseElementFnR => {
        if (elem.face?.index) {
            return [{
                faceElement: {
                    faceIndex: elem.face.index,
                    faceType: FaceType.Normal
                },
                elementType: ElementType.UNKNOWN,
                elementId: '',
            }, null];
        }
        if (elem?.commonElem?.serviceType === 37 && elem?.commonElem?.pbElem) {
            const qface = new NapProtoMsg(QBigFaceExtra).decode(elem?.commonElem?.pbElem);
            if (qface?.faceId) {
                return [{
                    faceElement: {
                        faceIndex: qface.faceId,
                        faceType: FaceType.Normal
                    },
                    elementType: ElementType.UNKNOWN,
                    elementId: '',
                }, null];
            }
        }
        if (elem?.commonElem?.serviceType === 33 && elem?.commonElem?.pbElem) {
            const qface = new NapProtoMsg(QSmallFaceExtra).decode(elem?.commonElem?.pbElem);
            if (qface?.faceId) {
                return [{
                    faceElement: {
                        faceIndex: qface.faceId,
                        faceType: FaceType.Normal
                    },
                    elementType: ElementType.UNKNOWN,
                    elementId: '',
                }, null];
            }
        }
        return undefined;
    };

    override toPreview(): string {
        return '[表情]';
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

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
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

    override toPreview(): string {
        return `${this.emojiName}`;
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
    picSubType: number;
    summary: string;
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
        this.picSubType = element.picElement.picSubType ?? 0;
        this.summary = element.picElement.summary === '' ? (
            element.picElement.picSubType === 0 ? '[图片]' : '[动画表情]'
        ) : element.picElement.summary;
    }

    override get valid(): boolean {
        return !!this.msgInfo;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (!this.msgInfo) return [];
        return [{
            commonElem: {
                serviceType: 48,
                pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
                businessType: 10,
            }
        }];
    }

    static override parseElement = (elem: NapProtoDecodeStructType<typeof Elem>): ParseElementFnR => {
        if (elem?.commonElem?.serviceType === 48 || [10, 20].includes(elem?.commonElem?.businessType ?? 0)) {
            const extra = new NapProtoMsg(MsgInfo).decode(elem.commonElem!.pbElem!);
            const msgInfoBody = extra.msgInfoBody[0];
            const index = msgInfoBody?.index;
            return [{
                picElement: {
                    fileSize: index?.info.fileSize ?? 0,
                    picWidth: index?.info?.width ?? 0,
                    picHeight: index?.info?.height ?? 0,
                    fileName: index?.info?.fileHash ?? '',
                    sourcePath: '',
                    original: false,
                    picType: PicType.NEWPIC_APNG,
                    fileUuid: '',
                    fileSubId: '',
                    thumbFileSize: 0,
                    summary: '[图片]',
                    thumbPath: new Map(),
                },
                elementType: ElementType.UNKNOWN,
                elementId: '',
            }, elem];
        }
        if (elem?.notOnlineImage) {
            const img = elem?.notOnlineImage; // url in originImageUrl
            const preImg: MessageElement = {
                picElement: {
                    fileSize: img.fileLen ?? 0,
                    picWidth: img.picWidth ?? 0,
                    picHeight: img.picHeight ?? 0,
                    fileName: Buffer.from(img.picMd5!).toString('hex') ?? '',
                    sourcePath: '',
                    original: false,
                    picType: PicType.NEWPIC_APNG,
                    fileUuid: '',
                    fileSubId: '',
                    thumbFileSize: 0,
                    summary: '[图片]',
                    thumbPath: new Map(),
                },
                elementType: ElementType.UNKNOWN,
                elementId: '',
            };
            if (img.origUrl?.includes('&fileid=')) {
                preImg.picElement!.originImageUrl = `https://multimedia.nt.qq.com.cn${img.origUrl}`;
            } else {
                preImg.picElement!.originImageUrl = `https://gchat.qpic.cn${img.origUrl}`;
            }
            return [preImg, elem];
        }
        return undefined;
    };

    override toPreview(): string {
        return this.summary;
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
        this.thumbPath = element.videoElement.thumbPath?.get(0) as string | undefined;
        this.fileMd5 = element.videoElement.videoMd5;
        this.thumbMd5 = element.videoElement.thumbMd5;
        this.thumbWidth = element.videoElement.thumbWidth;
        this.thumbHeight = element.videoElement.thumbHeight;
    }

    override get valid(): boolean {
        return !!this.msgInfo;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        if (!this.msgInfo) return [];
        return [{
            commonElem: {
                serviceType: 48,
                pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
                businessType: 21,
            }
        }];
    }

    override toPreview(): string {
        return '[视频]';
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

    override get valid(): boolean {
        return false;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [];
        // if (!this.msgInfo) return [];
        // return [{
        //     commonElem: {
        //         serviceType: 48,
        //         pbElem: new NapProtoMsg(MsgInfo).encode(this.msgInfo),
        //         businessType: 22,
        //     }
        // }];
    }

    override toPreview(): string {
        return '[语音]';
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
    _e37_800_rsp?: NapProtoEncodeStructType<typeof OidbSvcTrpcTcp0XE37_800Response>;

    constructor(element: SendFileElement) {
        super(element);
        this.fileName = element.fileElement.fileName;
        this.filePath = element.fileElement.filePath;
        this.fileSize = +element.fileElement.fileSize;
    }

    override get valid(): boolean {
        return this.isGroupFile || Boolean(this._e37_800_rsp);
    }

    override buildContent(): Uint8Array | undefined {
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
        });
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
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
                    extInfoString: '',
                    fileMd5: this.fileMd5,
                }
            }
        });
        lb.writeUInt16BE(transElemVal.length);
        return [{
            transElem: {
                elemType: 24,
                elemValue: Buffer.concat([Buffer.from([0x01]), lb, transElemVal]) // TLV
            }
        }];
    }

    override toPreview(): string {
        return `[文件]${this.fileName}`;
    }
}

export class PacketMsgLightAppElement extends IPacketMsgElement<SendArkElement> {
    payload: string;

    constructor(element: SendArkElement) {
        super(element);
        this.payload = element.arkElement.bytesData;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            lightAppElem: {
                data: Buffer.concat([
                    Buffer.from([0x01]),
                    zlib.deflateSync(Buffer.from(this.payload, 'utf-8'))
                ])
            }
        }];
    }

    override toPreview(): string {
        return '[卡片消息]';
    }
}

export class PacketMsgMarkDownElement extends IPacketMsgElement<SendMarkdownElement> {
    content: string;

    constructor(element: SendMarkdownElement) {
        super(element);
        this.content = element.markdownElement.content;
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
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

    override toPreview(): string {
        return `[Markdown消息 ${this.content}]`;
    }
}

export class PacketMultiMsgElement extends IPacketMsgElement<SendMultiForwardMsgElement> {
    resid: string;
    message: PacketMsg[];

    constructor(rawElement: SendMultiForwardMsgElement, message?: PacketMsg[]) {
        super(rawElement);
        this.resid = rawElement.multiForwardMsgElement.resId;
        this.message = message ?? [];
    }

    override buildElement(): NapProtoEncodeStructType<typeof Elem>[] {
        return [{
            lightAppElem: {
                data: Buffer.concat([
                    Buffer.from([0x01]),
                    zlib.deflateSync(Buffer.from(JSON.stringify(ForwardMsgBuilder.fromPacketMsg(this.resid, this.message)), 'utf-8'))
                ])
            }
        }];
    }

    override toPreview(): string {
        return '[聊天记录]';
    }
}
