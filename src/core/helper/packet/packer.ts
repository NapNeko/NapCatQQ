import * as zlib from "node:zlib";
import { NapProtoMsg } from "@/core/proto/NapProto";
import { OidbSvcTrpcTcpBase } from "@/core/proto/oidb/OidbBase";
import { OidbSvcTrpcTcp0X9067_202 } from "@/core/proto/oidb/Oidb.0x9067_202";
import { OidbSvcTrpcTcp0X8FC_2, OidbSvcTrpcTcp0X8FC_2_Body } from "@/core/proto/oidb/Oidb.0x8FC_2";
import { OidbSvcTrpcTcp0XFE1_2 } from "@/core/proto/oidb/Oidb.fe1_2";
import { OidbSvcTrpcTcp0XED3_1 } from "@/core/proto/oidb/Oidb.ed3_1";
import {LongMsgResult, SendLongMsgReq} from "@/core/proto/message/action";
import {PacketForwardNode, PacketMsgBuilder} from "@/core/helper/packet/msg/builder";

export type PacketHexStr = string & { readonly hexNya: unique symbol };

export class PacketPacker {
    private packetBuilder: PacketMsgBuilder

    constructor() {
        this.packetBuilder = new PacketMsgBuilder();
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
        let oidb_0xfe1_2 = new NapProtoMsg(OidbSvcTrpcTcp0XFE1_2).encode({
            uin: uin,
            key: [{ key: 27372 }]
        });
        return this.toHexStr(this.packOidbPacket(0xfe1, 2, oidb_0xfe1_2));
    }

    packUploadForwardMsg(selfUid: string, msg: PacketForwardNode[], groupUin: number = 0) : PacketHexStr {
        // console.log("packUploadForwardMsg START!!!", selfUid, msg, groupUin);
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
        )
        // console.log("packUploadForwardMsg LONGMSGRESULT!!!", this.toHexStr(longMsgResultData));
        const payload = zlib.gzipSync(Buffer.from(longMsgResultData));
        // console.log("packUploadForwardMsg PAYLOAD!!!", payload);
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
        )
        // console.log("packUploadForwardMsg REQ!!!", req);
        return this.toHexStr(req);
    }
}
