import * as zlib from "node:zlib";
import * as crypto from "node:crypto";
import { computeMd5AndLengthWithLimit } from "@/core/packet/utils/crypto/hash";
import { NapProtoMsg } from "@/core/packet/proto/NapProto";
import { OidbSvcTrpcTcpBase } from "@/core/packet/proto/oidb/OidbBase";
import { OidbSvcTrpcTcp0X9067_202 } from "@/core/packet/proto/oidb/Oidb.0x9067_202";
import { OidbSvcTrpcTcp0X8FC_2, OidbSvcTrpcTcp0X8FC_2_Body } from "@/core/packet/proto/oidb/Oidb.0x8FC_2";
import { OidbSvcTrpcTcp0XFE1_2 } from "@/core/packet/proto/oidb/Oidb.0XFE1_2";
import { OidbSvcTrpcTcp0XED3_1 } from "@/core/packet/proto/oidb/Oidb.0xED3_1";
import { NTV2RichMediaReq } from "@/core/packet/proto/oidb/common/Ntv2.RichMediaReq";
import { HttpConn0x6ff_501 } from "@/core/packet/proto/action/action";
import { LongMsgResult, SendLongMsgReq } from "@/core/packet/proto/message/action";
import { PacketMsgBuilder } from "@/core/packet/message/builder";
import {
    PacketMsgFileElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgVideoElement
} from "@/core/packet/message/element";
import { LogWrapper } from "@/common/log";
import { PacketMsg } from "@/core/packet/message/message";
import { OidbSvcTrpcTcp0x6D6 } from "@/core/packet/proto/oidb/Oidb.0x6D6";
import { OidbSvcTrpcTcp0XE37_1200 } from "@/core/packet/proto/oidb/Oidb.0xE37_1200";
import { PacketMsgConverter } from "@/core/packet/message/converter";
import { PacketClient } from "@/core/packet/client";
import { OidbSvcTrpcTcp0XE37_1700 } from "@/core/packet/proto/oidb/Oidb.0xE37_1700";
import { OidbSvcTrpcTcp0XE37_800 } from "@/core/packet/proto/oidb/Oidb.0XE37_800";
import { OidbSvcTrpcTcp0XEB7 } from "./proto/oidb/Oidb.0xEB7";
import { MiniAppReqParams } from "@/core/packet/entities/miniApp";
import { MiniAppAdaptShareInfoReq } from "@/core/packet/proto/action/miniAppAdaptShareInfo";

export type PacketHexStr = string & { readonly hexNya: unique symbol };

export interface OidbPacket {
    cmd: string;
    data: PacketHexStr
}

export class PacketPacker {
    readonly logger: LogWrapper;
    readonly client: PacketClient;
    readonly packetBuilder: PacketMsgBuilder;
    readonly packetConverter: PacketMsgConverter;

    constructor(logger: LogWrapper, client: PacketClient) {
        this.logger = logger;
        this.client = client;
        this.packetBuilder = new PacketMsgBuilder(logger);
        this.packetConverter = new PacketMsgConverter(logger);
    }

    private packetPacket(byteArray: Uint8Array): PacketHexStr {
        return Buffer.from(byteArray).toString('hex') as PacketHexStr;
    }

    packOidbPacket(cmd: number, subCmd: number, body: Uint8Array, isUid: boolean = true, isLafter: boolean = false): OidbPacket {
        const data = new NapProtoMsg(OidbSvcTrpcTcpBase).encode({
            command: cmd,
            subCommand: subCmd,
            body: body,
            isReserved: isUid ? 1 : 0
        });
        return {
            cmd: `OidbSvcTrpcTcp.0x${cmd.toString(16).toUpperCase()}_${subCmd}`,
            data: this.packetPacket(data)
        };
    }

    packPokePacket(peer: number, group?: number): OidbPacket {
        const oidb_0xed3 = new NapProtoMsg(OidbSvcTrpcTcp0XED3_1).encode({
            uin: peer,
            groupUin: group,
            friendUin: group ?? peer,
            ext: 0
        });
        return this.packOidbPacket(0xed3, 1, oidb_0xed3);
    }

    packRkeyPacket(): OidbPacket {
        const oidb_0x9067_202 = new NapProtoMsg(OidbSvcTrpcTcp0X9067_202).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 202
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
                    sceneType: 0
                },
                client: {
                    agentType: 2
                }
            },
            downloadRKeyReq: {
                key: [10, 20, 2]
            },
        });
        return this.packOidbPacket(0x9067, 202, oidb_0x9067_202);
    }

    packSetSpecialTittlePacket(groupCode: string, uid: string, tittle: string): OidbPacket {
        const oidb_0x8FC_2_body = new NapProtoMsg(OidbSvcTrpcTcp0X8FC_2_Body).encode({
            targetUid: uid,
            specialTitle: tittle,
            expiredTime: -1,
            uinName: tittle
        });
        const oidb_0x8FC_2 = new NapProtoMsg(OidbSvcTrpcTcp0X8FC_2).encode({
            groupUin: +groupCode,
            body: oidb_0x8FC_2_body
        });
        return this.packOidbPacket(0x8FC, 2, oidb_0x8FC_2, false, false);
    }

    packStatusPacket(uin: number): OidbPacket {
        const oidb_0xfe1_2 = new NapProtoMsg(OidbSvcTrpcTcp0XFE1_2).encode({
            uin: uin,
            key: [{ key: 27372 }]
        });
        return this.packOidbPacket(0xfe1, 2, oidb_0xfe1_2);
    }

    async packUploadForwardMsg(selfUid: string, msg: PacketMsg[], groupUin: number = 0): Promise<PacketHexStr> {
        const msgBody = this.packetBuilder.buildFakeMsg(selfUid, msg);
        const longMsgResultData = new NapProtoMsg(LongMsgResult).encode(
            {
                action: {
                    actionCommand: "MultiMsg",
                    actionData: {
                        msgBody: msgBody
                    }
                }
            }
        );
        const payload = zlib.gzipSync(Buffer.from(longMsgResultData));
        const req = new NapProtoMsg(SendLongMsgReq).encode(
            {
                info: {
                    type: groupUin === 0 ? 1 : 3,
                    uid: {
                        uid: groupUin === 0 ? selfUid : groupUin.toString(),
                    },
                    groupUin: groupUin,
                    payload: payload
                },
                settings: {
                    field1: 4, field2: 1, field3: 7, field4: 0
                }
            }
        );
        // this.logger.logDebug("packUploadForwardMsg REQ!!!", req);
        return this.packetPacket(req);
    }

    // highway part
    packHttp0x6ff_501(): PacketHexStr {
        return this.packetPacket(new NapProtoMsg(HttpConn0x6ff_501).encode({
            httpConn: {
                field1: 0,
                field2: 0,
                field3: 16,
                field4: 1,
                field6: 3,
                serviceTypes: [1, 5, 10, 21],
                // tgt: "",  // TODO: do we really need tgt? seems not
                field9: 2,
                field10: 9,
                field11: 8,
                ver: "1.0.1"
            }
        }));
    }

    async packUploadGroupImgReq(groupUin: number, img: PacketMsgPicElement): Promise<OidbPacket> {
        const req = new NapProtoMsg(NTV2RichMediaReq).encode(
            {
                reqHead: {
                    common: {
                        requestId: 1,
                        command: 100
                    },
                    scene: {
                        requestType: 2,
                        businessType: 1,
                        sceneType: 2,
                        group: {
                            groupUin: groupUin
                        },
                    },
                    client: {
                        agentType: 2
                    }
                },
                upload: {
                    uploadInfo: [
                        {
                            fileInfo: {
                                fileSize: +img.size,
                                fileHash: img.md5,
                                fileSha1: img.sha1!,
                                fileName: img.name,
                                type: {
                                    type: 1,
                                    picFormat: img.picType,  //TODO: extend NapCat imgType /cc @MliKiowa
                                    videoFormat: 0,
                                    voiceFormat: 0,
                                },
                                width: img.width,
                                height: img.height,
                                time: 0,
                                original: 1
                            },
                            subFileType: 0,
                        }
                    ],
                    tryFastUploadCompleted: true,
                    srvSendMsg: false,
                    clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                    compatQMsgSceneType: 2,
                    extBizInfo: {
                        pic: {
                            bytesPbReserveTroop: Buffer.from("0800180020004200500062009201009a0100a2010c080012001800200028003a00", 'hex'),
                            textSummary: "Nya~",  // TODO:
                        },
                        video: {
                            bytesPbReserve: Buffer.alloc(0),
                        },
                        ptt: {
                            bytesPbReserve: Buffer.alloc(0),
                            bytesReserve: Buffer.alloc(0),
                            bytesGeneralFlags: Buffer.alloc(0),
                        }
                    },
                    clientSeq: 0,
                    noNeedCompatMsg: false,
                }
            }
        );
        return this.packOidbPacket(0x11c4, 100, req, true, false);
    }

    async packUploadC2CImgReq(peerUin: string, img: PacketMsgPicElement): Promise<OidbPacket> {
        const req = new NapProtoMsg(NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 1,
                    sceneType: 1,
                    c2C: {
                        accountType: 2,
                        targetUid: peerUin
                    },
                },
                client: {
                    agentType: 2,
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: +img.size,
                            fileHash: img.md5,
                            fileSha1: img.sha1!,
                            fileName: img.name,
                            type: {
                                type: 1,
                                picFormat: img.picType,  //TODO: extend NapCat imgType /cc @MliKiowa
                                videoFormat: 0,
                                voiceFormat: 0,
                            },
                            width: img.width,
                            height: img.height,
                            time: 0,
                            original: 1
                        },
                        subFileType: 0,
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 1,
                extBizInfo: {
                    pic: {
                        bytesPbReserveTroop: Buffer.from("0800180020004200500062009201009a0100a2010c080012001800200028003a00", 'hex'),
                        textSummary: "Nya~",  // TODO:
                    },
                    video: {
                        bytesPbReserve: Buffer.alloc(0),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.alloc(0),
                        bytesGeneralFlags: Buffer.alloc(0),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false,
            }
        }
        );
        return this.packOidbPacket(0x11c5, 100, req, true, false);
    }

    async packUploadGroupVideoReq(groupUin: number, video: PacketMsgVideoElement): Promise<OidbPacket> {
        if (!video.fileSize || !video.thumbSize) throw new Error("video.fileSize or video.thumbSize is empty");
        const req = new NapProtoMsg(NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 3,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 2,
                    sceneType: 2,
                    group: {
                        groupUin: groupUin
                    },
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: +video.fileSize,
                            fileHash: video.fileMd5,
                            fileSha1: video.fileSha1,
                            fileName: "nya.mp4",
                            type: {
                                type: 2,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 0
                            },
                            height: 0,
                            width: 0,
                            time: 0,
                            original: 0
                        },
                        subFileType: 0
                    }, {
                        fileInfo: {
                            fileSize: +video.thumbSize,
                            fileHash: video.thumbMd5,
                            fileSha1: video.thumbSha1,
                            fileName: "nya.jpg",
                            type: {
                                type: 1,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 0
                            },
                            height: video.thumbHeight,
                            width: video.thumbWidth,
                            time: 0,
                            original: 0
                        },
                        subFileType: 100
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 2,
                extBizInfo: {
                    pic: {
                        bizType: 0,
                        textSummary: "Nya~",
                    },
                    video: {
                        bytesPbReserve: Buffer.from([0x80, 0x01, 0x00]),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.alloc(0),
                        bytesGeneralFlags: Buffer.alloc(0),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false
            }
        });
        return this.packOidbPacket(0x11EA, 100, req, true, false);
    }

    async packUploadC2CVideoReq(peerUin: string, video: PacketMsgVideoElement): Promise<OidbPacket> {
        if (!video.fileSize || !video.thumbSize) throw new Error("video.fileSize or video.thumbSize is empty");
        const req = new NapProtoMsg(NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 3,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 2,
                    sceneType: 1,
                    c2C: {
                        accountType: 2,
                        targetUid: peerUin
                    }
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: +video.fileSize,
                            fileHash: video.fileMd5,
                            fileSha1: video.fileSha1,
                            fileName: "nya.mp4",
                            type: {
                                type: 2,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 0
                            },
                            height: 0,
                            width: 0,
                            time: 0,
                            original: 0
                        },
                        subFileType: 0
                    }, {
                        fileInfo: {
                            fileSize: +video.thumbSize,
                            fileHash: video.thumbMd5,
                            fileSha1: video.thumbSha1,
                            fileName: "nya.jpg",
                            type: {
                                type: 1,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 0
                            },
                            height: video.thumbHeight,
                            width: video.thumbWidth,
                            time: 0,
                            original: 0
                        },
                        subFileType: 100
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 2,
                extBizInfo: {
                    pic: {
                        bizType: 0,
                        textSummary: "Nya~",
                    },
                    video: {
                        bytesPbReserve: Buffer.from([0x80, 0x01, 0x00]),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.alloc(0),
                        bytesGeneralFlags: Buffer.alloc(0),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false
            }
        });
        return this.packOidbPacket(0x11E9, 100, req, true, false);
    }

    async packUploadGroupPttReq(groupUin: number, ptt: PacketMsgPttElement): Promise<OidbPacket> {
        const req = new NapProtoMsg(NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 1,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 3,
                    sceneType: 2,
                    group: {
                        groupUin: groupUin
                    }
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: ptt.fileSize,
                            fileHash: ptt.fileMd5,
                            fileSha1: ptt.fileSha1,
                            fileName: `${ptt.fileMd5}.amr`,
                            type: {
                                type: 3,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 1
                            },
                            height: 0,
                            width: 0,
                            time: ptt.fileDuration,
                            original: 0
                        },
                        subFileType: 0
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 2,
                extBizInfo: {
                    pic: {
                        textSummary: "Nya~",
                    },
                    video: {
                        bytesPbReserve: Buffer.alloc(0),
                    },
                    ptt: {
                        bytesPbReserve: Buffer.alloc(0),
                        bytesReserve: Buffer.from([0x08, 0x00, 0x38, 0x00]),
                        bytesGeneralFlags: Buffer.from([0x9a, 0x01, 0x07, 0xaa, 0x03, 0x04, 0x08, 0x08, 0x12, 0x00]),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false
            }
        });
        return this.packOidbPacket(0x126E, 100, req, true, false);
    }

    async packUploadC2CPttReq(peerUin: string, ptt: PacketMsgPttElement): Promise<OidbPacket> {
        const req = new NapProtoMsg(NTV2RichMediaReq).encode({
            reqHead: {
                common: {
                    requestId: 4,
                    command: 100
                },
                scene: {
                    requestType: 2,
                    businessType: 3,
                    sceneType: 1,
                    c2C: {
                        accountType: 2,
                        targetUid: peerUin
                    }
                },
                client: {
                    agentType: 2
                }
            },
            upload: {
                uploadInfo: [
                    {
                        fileInfo: {
                            fileSize: ptt.fileSize,
                            fileHash: ptt.fileMd5,
                            fileSha1: ptt.fileSha1,
                            fileName: `${ptt.fileMd5}.amr`,
                            type: {
                                type: 3,
                                picFormat: 0,
                                videoFormat: 0,
                                voiceFormat: 1
                            },
                            height: 0,
                            width: 0,
                            time: ptt.fileDuration,
                            original: 0
                        },
                        subFileType: 0
                    }
                ],
                tryFastUploadCompleted: true,
                srvSendMsg: false,
                clientRandomId: crypto.randomBytes(8).readBigUInt64BE() & BigInt('0x7FFFFFFFFFFFFFFF'),
                compatQMsgSceneType: 1,
                extBizInfo: {
                    pic: {
                        textSummary: "Nya~",
                    },
                    ptt: {
                        bytesReserve: Buffer.from([0x08, 0x00, 0x38, 0x00]),
                        bytesGeneralFlags: Buffer.from([0x9a, 0x01, 0x0b, 0xaa, 0x03, 0x08, 0x08, 0x04, 0x12, 0x04, 0x00, 0x00, 0x00, 0x00]),
                    }
                },
                clientSeq: 0,
                noNeedCompatMsg: false
            }
        });
        return this.packOidbPacket(0x126D, 100, req, true, false);
    }

    async packUploadGroupFileReq(groupUin: number, file: PacketMsgFileElement): Promise<OidbPacket> {
        const body = new NapProtoMsg(OidbSvcTrpcTcp0x6D6).encode({
            file: {
                groupUin: groupUin,
                appId: 4,
                busId: 102,
                entrance: 6,
                targetDirectory: '/',  // TODO:
                fileName: file.fileName,
                localDirectory: `/${file.fileName}`,
                fileSize: BigInt(file.fileSize),
                fileMd5: file.fileMd5,
                fileSha1: file.fileSha1,
                fileSha3: Buffer.alloc(0),
                field15: true
            }
        });
        return this.packOidbPacket(0x6D6, 0, body, true, false);
    }

    async packUploadC2CFileReq(selfUid: string, peerUid: string, file: PacketMsgFileElement): Promise<OidbPacket> {
        const body = new NapProtoMsg(OidbSvcTrpcTcp0XE37_1700).encode({
            command: 1700,
            seq: 0,
            upload: {
                senderUid: selfUid,
                receiverUid: peerUid,
                fileSize: file.fileSize,
                fileName: file.fileName,
                md510MCheckSum: await computeMd5AndLengthWithLimit(file.filePath, 10 * 1024 * 1024),
                sha1CheckSum: file.fileSha1,
                localPath: "/",
                md5CheckSum: file.fileMd5,
                sha3CheckSum: Buffer.alloc(0)
            },
            businessId: 3,
            clientType: 1,
            flagSupportMediaPlatform: 1
        });
        return this.packOidbPacket(0xE37, 1700, body, false, false);
    }

    packOfflineFileDownloadReq(fileUUID: string, fileHash: string, senderUid: string, receiverUid: string): OidbPacket {
        return this.packOidbPacket(0xE37, 800, new NapProtoMsg(OidbSvcTrpcTcp0XE37_800).encode({
            subCommand: 800,
            field2: 0,
            body: {
                senderUid: senderUid,
                receiverUid: receiverUid,
                fileUuid: fileUUID,
                fileHash: fileHash,
            },
            field101: 3,
            field102: 1,
            field200: 1,
        }), false, false);
    }

    packGroupFileDownloadReq(groupUin: number, fileUUID: string): OidbPacket {
        return this.packOidbPacket(0x6D6, 2, new NapProtoMsg(OidbSvcTrpcTcp0x6D6).encode({
            download: {
                groupUin: groupUin,
                appId: 7,
                busId: 102,
                fileId: fileUUID
            }
        }), true, false
        );
    }

    packC2CFileDownloadReq(selfUid: string, fileUUID: string, fileHash: string): PacketHexStr {
        return this.packetPacket(
            new NapProtoMsg(OidbSvcTrpcTcp0XE37_1200).encode({
                subCommand: 1200,
                field2: 1,
                body: {
                    receiverUid: selfUid,
                    fileUuid: fileUUID,
                    type: 2,
                    fileHash: fileHash,
                    t2: 0
                },
                field101: 3,
                field102: 103,
                field200: 1,
                field99999: Buffer.from([0xc0, 0x85, 0x2c, 0x01])
            })
        );
    }

    packGroupSignReq(uin: string, groupCode: string): OidbPacket {
        return this.packOidbPacket(0XEB7, 1, new NapProtoMsg(OidbSvcTrpcTcp0XEB7).encode(
            {
                body: {
                    uin: uin,
                    groupUin: groupCode,
                    version: "9.0.90"
                }
            }
        ), false, false);
    }

    packMiniAppAdaptShareInfo(req: MiniAppReqParams): PacketHexStr {
        return this.packetPacket(
            new NapProtoMsg(MiniAppAdaptShareInfoReq).encode(
                {
                    appId: req.sdkId,
                    body: {
                        extInfo: {
                            field2: Buffer.alloc(0)
                        },
                        appid: req.appId,
                        title: req.title,
                        desc: req.desc,
                        time: BigInt(Date.now()),
                        scene: req.scene,
                        templateType: req.templateType,
                        businessType: req.businessType,
                        picUrl: req.picUrl,
                        vidUrl: "",
                        jumpUrl: req.jumpUrl,
                        iconUrl: req.iconUrl,
                        verType: req.verType,
                        shareType: req.shareType,
                        versionId: req.versionId,
                        withShareTicket: req.withShareTicket,
                        webURL: "",
                        appidRich: Buffer.alloc(0),
                        template: {
                            templateId: "",
                            templateData: ""
                        },
                        field20: ""
                    }
                }
            )
        );
    }
}
