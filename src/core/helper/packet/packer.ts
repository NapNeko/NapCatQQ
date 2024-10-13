import { NapProtoMsg } from "@/core/proto/NapProto";
import { OidbSvcTrpcTcpBase } from "@/core/proto/oidb/OidbBase";
import { OidbSvcTrpcTcp0X9067_202 } from "@/core/proto/oidb/Oidb.0x9067_202";
import { OidbSvcTrpcTcp0X8FC_2, OidbSvcTrpcTcp0X8FC_2_Body } from "@/core/proto/oidb/Oidb.0x8FC_2";
import { OidbSvcTrpcTcp0XFE1_2 } from "@/core/proto/oidb/Oidb.fe1_2";
import { OidbSvcTrpcTcp0XED3_1 } from "@/core/proto/oidb/Oidb.ed3_1";

export type PacketHexStr = string & { readonly hexNya: unique symbol };

export class PacketPacker {
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
}
