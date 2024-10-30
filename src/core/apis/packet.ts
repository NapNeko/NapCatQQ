import * as os from 'os';
import { ChatType, InstanceContext, NapCatCore } from '..';
import offset from '@/core/external/offset.json';
import { PacketClient, RecvPacketData } from '@/core/packet/client';
import { PacketSession } from "@/core/packet/session";
import { OidbPacket, PacketHexStr } from "@/core/packet/packer";
import { NapProtoMsg } from '@/core/packet/proto/NapProto';
import { OidbSvcTrpcTcp0X9067_202_Rsp_Body } from '@/core/packet/proto/oidb/Oidb.0x9067_202';
import { OidbSvcTrpcTcpBase, OidbSvcTrpcTcpBaseRsp } from '@/core/packet/proto/oidb/OidbBase';
import { OidbSvcTrpcTcp0XFE1_2RSP } from '@/core/packet/proto/oidb/Oidb.0XFE1_2';
import { LogWrapper } from "@/common/log";
import { SendLongMsgResp } from "@/core/packet/proto/message/action";
import { PacketMsg } from "@/core/packet/message/message";
import { OidbSvcTrpcTcp0x6D6Response } from "@/core/packet/proto/oidb/Oidb.0x6D6";
import {
    PacketMsgFileElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgVideoElement
} from "@/core/packet/message/element";
import { MiniAppReqParams, MiniAppRawData } from "@/core/packet/entities/miniApp";
import { MiniAppAdaptShareInfoResp } from "@/core/packet/proto/action/miniAppAdaptShareInfo";


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
    logger: LogWrapper;
    serverUrl: string | undefined;
    qqVersion: string | undefined;
    packetSession: PacketSession | undefined;

    constructor(context: InstanceContext, core: NapCatCore) {
        this.context = context;
        this.core = core;
        this.logger = core.context.logger;
        this.packetSession = undefined;
        const config = this.core.configLoader.configData;
        if (config && config.packetServer && config.packetServer.length > 0) {
            const serverUrl = this.core.configLoader.configData.packetServer ?? '127.0.0.1:8086';
            this.InitSendPacket(serverUrl, this.context.basicInfoWrapper.getFullQQVesion())
                .then()
                .catch(this.core.context.logger.logError.bind(this.core.context.logger));
        } else {
            this.core.context.logger.logWarn('PacketServer未配置，NapCat.Packet将不会加载！');
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
        if (!table) {
            this.logger.logError('PacketServer Offset table not found for QQVersion: ', qqversion + '-' + os.arch());
            return false;
        }
        const url = 'ws://' + this.serverUrl + '/ws';
        this.packetSession = new PacketSession(this.core.context.logger, new PacketClient(url, this.core));
        const cb = () => {
            if (this.packetSession && this.packetSession.client) {
                this.packetSession.client.init(process.pid, table.recv, table.send).then().catch(this.logger.logError.bind(this.logger));
            }
        };
        await this.packetSession.client.connect(cb);
        return true;
    }

    async sendPacket(cmd: string, data: PacketHexStr, rsp = false): Promise<RecvPacketData> {
        return this.packetSession!.client.sendPacket(cmd, data, rsp);
    }

    async sendOidbPacket(pkt: OidbPacket, rsp = false): Promise<RecvPacketData> {
        return this.sendPacket(pkt.cmd, pkt.data, rsp);
    }

    async sendPokePacket(peer: number, group?: number) {
        const data = this.packetSession?.packer.packPokePacket(peer, group);
        await this.sendOidbPacket(data!, false);
    }

    async sendRkeyPacket() {
        const packet = this.packetSession?.packer.packRkeyPacket();
        const ret = await this.sendOidbPacket(packet!, true);
        if (!ret?.hex_data) return [];
        const body = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(Buffer.from(ret.hex_data, 'hex')).body;
        const retData = new NapProtoMsg(OidbSvcTrpcTcp0X9067_202_Rsp_Body).decode(body);
        return retData.data.rkeyList;
    }
    async sendGroupSignPacket(groupCode: string) {
        const packet = this.packetSession?.packer.packGroupSignReq(this.core.selfInfo.uin, groupCode);
        await this.sendOidbPacket(packet!, true);
    }
    async sendStatusPacket(uin: number): Promise<{ status: number; ext_status: number; } | undefined> {
        let status = 0;
        try {
            const packet = this.packetSession?.packer.packStatusPacket(uin);
            const ret = await this.sendOidbPacket(packet!, true);
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
        const data = this.packetSession?.packer.packSetSpecialTittlePacket(groupCode, uid, tittle);
        await this.sendOidbPacket(data!, true);
    }

    // TODO: can simplify this
    async uploadResources(msg: PacketMsg[], groupUin: number = 0) {
        const reqList = [];
        for (const m of msg) {
            for (const e of m.msg) {
                if (e instanceof PacketMsgPicElement) {
                    reqList.push(this.packetSession?.highwaySession.uploadImage({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.core.selfInfo.uid
                    }, e));
                }
                if (e instanceof PacketMsgVideoElement) {
                    reqList.push(this.packetSession?.highwaySession.uploadVideo({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.core.selfInfo.uid
                    }, e));
                }
                if (e instanceof PacketMsgPttElement) {
                    reqList.push(this.packetSession?.highwaySession.uploadPtt({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.core.selfInfo.uid
                    }, e));
                }
                if (e instanceof PacketMsgFileElement) {
                    reqList.push(this.packetSession?.highwaySession.uploadFile({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.core.selfInfo.uid
                    }, e));
                }
            }
        }
        const res = await Promise.allSettled(reqList);
        this.logger.log(`上传资源${res.length}个，失败${res.filter(r => r.status === 'rejected').length}个`);
        res.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.logger.logError(`上传第${index + 1}个资源失败：${result.reason}`);
            }
        });
    }

    async sendUploadForwardMsg(msg: PacketMsg[], groupUin: number = 0) {
        await this.uploadResources(msg, groupUin);
        const data = await this.packetSession?.packer.packUploadForwardMsg(this.core.selfInfo.uid, msg, groupUin);
        const ret = await this.sendPacket('trpc.group.long_msg_interface.MsgService.SsoSendLongMsg', data!, true);
        this.logger.logDebug('sendUploadForwardMsg', ret);
        const resp = new NapProtoMsg(SendLongMsgResp).decode(Buffer.from(ret.hex_data, 'hex'));
        return resp.result.resId;
    }

    async sendGroupFileDownloadReq(groupUin: number, fileUUID: string) {
        const data = this.packetSession?.packer.packGroupFileDownloadReq(groupUin, fileUUID);
        const ret = await this.sendOidbPacket(data!, true);
        const body = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(Buffer.from(ret.hex_data, 'hex')).body;
        const resp = new NapProtoMsg(OidbSvcTrpcTcp0x6D6Response).decode(body);
        if (resp.download.retCode !== 0) {
            throw new Error(`sendGroupFileDownloadReq error: ${resp.download.clientWording}`);
        }
        return `https://${resp.download.downloadDns}/ftn_handler/${Buffer.from(resp.download.downloadUrl).toString('hex')}/?fname=`;
    }

    async sendMiniAppShareInfoReq(param: MiniAppReqParams) {
        const data = this.packetSession?.packer.packMiniAppAdaptShareInfo(param);
        const ret = await this.sendPacket("LightAppSvc.mini_app_share.AdaptShareInfo", data!, true);
        const body = new NapProtoMsg(MiniAppAdaptShareInfoResp).decode(Buffer.from(ret.hex_data, 'hex'));
        return JSON.parse(body.content.jsonContent) as MiniAppRawData;
    }
}
