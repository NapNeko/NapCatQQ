import * as os from 'os';
import { InstanceContext, NapCatCore } from '..';
import offset from '@/core/external/offset.json';
import { PacketClient, RecvPacketData } from '@/core/packet/client';
import { PacketSession } from "@/core/packet/session";
import { PacketHexStr, PacketPacker } from "@/core/packet/packer";
import { NapProtoMsg } from '@/core/packet/proto/NapProto';
import { OidbSvcTrpcTcp0X9067_202_Rsp_Body } from '@/core/packet/proto/oidb/Oidb.0x9067_202';
import { OidbSvcTrpcTcpBase, OidbSvcTrpcTcpBaseRsp } from '@/core/packet/proto/oidb/OidbBase';
import { OidbSvcTrpcTcp0XFE1_2RSP } from '@/core/packet/proto/oidb/Oidb.fe1_2';
import { PacketForwardNode } from "@/core/packet/msg/entity/forward";
import {LogWrapper} from "@/common/log";
import {SendLongMsgResp} from "@/core/packet/proto/message/action";

interface OffsetType {
    [key: string]: {
        recv: string;
        send: string;
    };
}

const typedOffset: OffsetType = offset;

export class NTQQPacketApi {
    context: InstanceContext;
    core: NapCatCore;
    logger: LogWrapper
    serverUrl: string | undefined;
    qqVersion: string | undefined;
    packetPacker: PacketPacker;
    packetSession: PacketSession | undefined;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.logger = core.context.logger;
        this.packetPacker = new PacketPacker(this.logger);
        this.packetSession = undefined;
        const config = this.core.configLoader.configData;
        if (config && config.packetServer && config.packetServer.length > 0) {
            const serverUrl = this.core.configLoader.configData.packetServer ?? '127.0.0.1:8086';
            this.InitSendPacket(serverUrl, this.context.basicInfoWrapper.getFullQQVesion())
                .then()
                .catch(this.core.context.logger.logError.bind(this.core.context.logger));
        } else {
            this.core.context.logger.logWarn('PacketServer is not set, will not init NapCat.Packet!');
        }
    }

    get available(): boolean {
        return this.packetSession?.client.available ?? false;
    }

    async InitSendPacket(serverUrl: string, qqversion: string) {
        this.serverUrl = serverUrl;
        this.qqVersion = qqversion;
        const offsetTable: OffsetType = offset;
        const table = offsetTable[qqversion + '-' + os.arch()];
        if (!table) return false;
        const url = 'ws://' + this.serverUrl + '/ws';
        this.packetSession = new PacketSession(this.core.context.logger, new PacketClient(url, this.core));
        await this.packetSession.client.connect();
        await this.packetSession.client.init(process.pid, table.recv, table.send);
        return true;
    }

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false): Promise<RecvPacketData> {
        return this.packetSession!.client.sendPacket(cmd, data, rsp);
    }

    async sendPokePacket(group: number, peer: number) {
        const data = this.packetPacker.packPokePacket(group, peer);
        await this.sendPacket('OidbSvcTrpcTcp.0xed3_1', data, false);
    }

    async sendRkeyPacket() {
        const packet = this.packetPacker.packRkeyPacket();
        const ret = await this.sendPacket('OidbSvcTrpcTcp.0x9067_202', packet, true);
        if (!ret?.hex_data) return [];
        const body = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(Buffer.from(ret.hex_data, 'hex')).body;
        //console.log('ret: ', Buffer.from(body).toString('hex'));
        const retData = new NapProtoMsg(OidbSvcTrpcTcp0X9067_202_Rsp_Body).decode(body);
        //console.log('ret: ', JSON.stringify(retData.data.rkeyList));
        return retData.data.rkeyList;
    }

    async sendStatusPacket(uin: number): Promise<{ status: number; ext_status: number; } | undefined> {
        let status = 0;
        try {
            const packet = this.packetPacker.packStatusPacket(uin);
            const ret = await this.sendPacket('OidbSvcTrpcTcp.0xfe1_2', packet, true);
            const data = Buffer.from(ret.hex_data, 'hex');
            const ext = new NapProtoMsg(OidbSvcTrpcTcp0XFE1_2RSP).decode(new NapProtoMsg(OidbSvcTrpcTcpBase).decode(data).body).data.status.value;
            // ext & 0xff00 + ext >> 16 & 0xff
            const extBigInt = BigInt(ext); // 转换为 BigInt
            if (extBigInt <= 10n) {
                return { status: Number(extBigInt) * 10, ext_status: 0 };
            }
            status = Number((extBigInt & 0xff00n) + ((extBigInt >> 16n) & 0xffn)); // 使用 BigInt 操作符
            return { status: 10, ext_status: status };
        } catch (error) {
            return undefined;
        }
    }

    async sendSetSpecialTittlePacket(groupCode: string, uid: string, tittle: string) {
        const data = this.packetPacker.packSetSpecialTittlePacket(groupCode, uid, tittle);
        await this.sendPacket('OidbSvcTrpcTcp.0x8fc_2', data, true);
    }

    async sendUploadForwardMsg(msg: PacketForwardNode[], groupUin: number = 0) {
        const data = this.packetPacker.packUploadForwardMsg(this.core.selfInfo.uid, msg, groupUin);
        const ret = await this.sendPacket('trpc.group.long_msg_interface.MsgService.SsoSendLongMsg', data, true);
        const resp = new NapProtoMsg(SendLongMsgResp).decode(Buffer.from(ret.hex_data, 'hex'));
        return resp.result.resId;
    }
}
