import * as zlib from "node:zlib";
import * as crypto from "node:crypto";
import {calculateSha1} from "@/core/packet/utils/crypto/hash"
import {NapProtoMsg} from "@/core/packet/proto/NapProto";
import {OidbSvcTrpcTcpBase} from "@/core/packet/proto/oidb/OidbBase";
import {OidbSvcTrpcTcp0X9067_202} from "@/core/packet/proto/oidb/Oidb.0x9067_202";
import {OidbSvcTrpcTcp0X8FC_2, OidbSvcTrpcTcp0X8FC_2_Body} from "@/core/packet/proto/oidb/Oidb.0x8FC_2";
import {OidbSvcTrpcTcp0XFE1_2} from "@/core/packet/proto/oidb/Oidb.fe1_2";
import {OidbSvcTrpcTcp0XED3_1} from "@/core/packet/proto/oidb/Oidb.ed3_1";
import {NTV2RichMediaReq} from "@/core/packet/proto/oidb/common/Ntv2.RichMediaReq";
import {HttpConn0x6ff_501} from "@/core/packet/proto/action/action";
import {LongMsgResult, SendLongMsgReq} from "@/core/packet/proto/message/action";
import {PacketMsgBuilder} from "@/core/packet/msg/builder";
import {PacketForwardNode} from "@/core/packet/msg/entity/forward";
import {PacketMsgPicElement} from "@/core/packet/msg/element";
import {LogWrapper} from "@/common/log";

export type PacketHexStr = string & { readonly hexNya: unique symbol };

export class PacketPacker {
    private readonly logger: LogWrapper;
    private readonly packetBuilder: PacketMsgBuilder;

    constructor(logger: LogWrapper) {
        this.logger = logger;
        this.packetBuilder = new PacketMsgBuilder(logger);
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

    packPokePacket(group: number, peer: number): PacketHexStr {
        const oidb_0xed3 = new NapProtoMsg(OidbSvcTrpcTcp0XED3_1).encode({
            uin: peer,
            groupUin: group,
            friendUin: group,
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
            key: [{key: 27372}]
        });
        return this.toHexStr(this.packOidbPacket(0xfe1, 2, oidb_0xfe1_2));
    }

    packUploadForwardMsg(selfUid: string, msg: PacketForwardNode[], groupUin: number = 0): PacketHexStr {
        // this.logger.logDebug("packUploadForwardMsg START!!!", selfUid, msg, groupUin);
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
        this.logger.logDebug("packUploadForwardMsg LONGMSGRESULT!!!", this.toHexStr(longMsgResultData));
        const payload = zlib.gzipSync(Buffer.from(longMsgResultData));
        // this.logger.logDebug("packUploadForwardMsg PAYLOAD!!!", payload);
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
    packHttp0x6ff_501() {
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

    async packUploadGroupImgReq(groupUin: number, img: PacketMsgPicElement) {
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
        )
        return this.toHexStr(this.packOidbPacket(0x11c4, 100, req, true, false));
    }

    async packUploadC2CImgReq(peerUin: string, img: PacketMsgPicElement) {
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
        )
        return this.toHexStr(this.packOidbPacket(0x11c5, 100, req, true, false));
    }
}