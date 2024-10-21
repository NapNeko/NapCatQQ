import * as zlib from "node:zlib";
import * as crypto from "node:crypto";
import { calculateSha1 } from "@/core/packet/utils/crypto/hash";
import { NapProtoMsg } from "@/core/packet/proto/NapProto";
import { OidbSvcTrpcTcpBase } from "@/core/packet/proto/oidb/OidbBase";
import { OidbSvcTrpcTcp0X9067_202 } from "@/core/packet/proto/oidb/Oidb.0x9067_202";
import { OidbSvcTrpcTcp0X8FC_2, OidbSvcTrpcTcp0X8FC_2_Body } from "@/core/packet/proto/oidb/Oidb.0x8FC_2";
import { OidbSvcTrpcTcp0XFE1_2 } from "@/core/packet/proto/oidb/Oidb.0XFE1_2";
import { OidbSvcTrpcTcp0XED3_1 } from "@/core/packet/proto/oidb/Oidb.0xED3_1";
import { NTV2RichMediaReq } from "@/core/packet/proto/oidb/common/Ntv2.RichMediaReq";
import { HttpConn0x6ff_501 } from "@/core/packet/proto/action/action";
import { LongMsgResult, SendLongMsgReq } from "@/core/packet/proto/message/action";
import { PacketMsgBuilder } from "@/core/packet/msg/builder";
import { PacketMsgPicElement } from "@/core/packet/msg/element";
import { LogWrapper } from "@/common/log";
import { PacketMsg } from "@/core/packet/msg/message";
import { OidbSvcTrpcTcp0x6D6 } from "@/core/packet/proto/oidb/Oidb.0x6D6";
import { OidbSvcTrpcTcp0XE37_1200 } from "@/core/packet/proto/oidb/Oidb.0xE37_1200";
import { PacketMsgConverter } from "@/core/packet/msg/converter";
import { PacketClient } from "@/core/packet/client";

export type PacketHexStr = string & { readonly hexNya: unique symbol };

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

    private toHexStr(byteArray: Uint8Array): PacketHexStr {
        return Buffer.from(byteArray).toString('hex') as PacketHexStr;
    }

    packOidbPacket(cmd: number, subCmd: number, body: Uint8Array, isUid: boolean = true, isLafter: boolean = false): Uint8Array {
        return new NapProtoMsg(OidbSvcTrpcTcpBase).encode({
            command: cmd,
            subCommand: subCmd,
            body: body,
            isReserved: isUid ? 1 : 0
        });
    }

    packPokePacket(peer: number, group?: number): PacketHexStr {
        const oidb_0xed3 = new NapProtoMsg(OidbSvcTrpcTcp0XED3_1).encode({
            uin: peer,
            groupUin: group,
            friendUin: group ?? peer,
            ext: 0
        });
        return this.toHexStr(this.packOidbPacket(0xed3, 1, oidb_0xed3));
    }

    packRkeyPacket(): PacketHexStr {
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
        return this.toHexStr(this.packOidbPacket(0x9067, 202, oidb_0x9067_202));
    }

    packSetSpecialTittlePacket(groupCode: string, uid: string, tittle: string): PacketHexStr {
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
        return this.toHexStr(this.packOidbPacket(0x8FC, 2, oidb_0x8FC_2, false, false));
    }

    packStatusPacket(uin: number): PacketHexStr {
        const oidb_0xfe1_2 = new NapProtoMsg(OidbSvcTrpcTcp0XFE1_2).encode({
            uin: uin,
            key: [{ key: 27372 }]
        });
        return this.toHexStr(this.packOidbPacket(0xfe1, 2, oidb_0xfe1_2));
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
        return this.toHexStr(req);
    }

    // highway part
    packHttp0x6ff_501(): PacketHexStr {
        return this.toHexStr(new NapProtoMsg(HttpConn0x6ff_501).encode({
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

    async packUploadGroupImgReq(groupUin: number, img: PacketMsgPicElement): Promise<PacketHexStr> {
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
                                fileSize: Number(img.size),
                                fileHash: img.md5,
                                fileSha1: this.toHexStr(await calculateSha1(img.path)),
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
        return this.toHexStr(this.packOidbPacket(0x11c4, 100, req, true, false));
    }

    async packUploadC2CImgReq(peerUin: string, img: PacketMsgPicElement): Promise<PacketHexStr> {
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
                            fileSize: Number(img.size),
                            fileHash: img.md5,
                            fileSha1: this.toHexStr(await calculateSha1(img.path)),
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
        return this.toHexStr(this.packOidbPacket(0x11c5, 100, req, true, false));
    }

    packGroupFileDownloadReq(groupUin: number, fileUUID: string): PacketHexStr {
        return this.toHexStr(
            this.packOidbPacket(0x6D6, 2, new NapProtoMsg(OidbSvcTrpcTcp0x6D6).encode({
                download: {
                    groupUin: groupUin,
                    appId: 7,
                    busId: 102,
                    fileId: fileUUID
                }
            }), true, false)
        );
    }

    packC2CFileDownloadReq(selfUid: string, fileUUID: string, fileHash: string): PacketHexStr {
        return this.toHexStr(
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
}
