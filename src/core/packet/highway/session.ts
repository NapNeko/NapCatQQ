import * as fs from "node:fs";
import { ChatType, Peer } from "@/core";
import { LogWrapper } from "@/common/log";
import { PacketClient } from "@/core/packet/client";
import { PacketPacker } from "@/core/packet/packer";
import { NapProtoMsg } from "@/core/packet/proto/NapProto";
import { HttpConn0x6ff_501Response } from "@/core/packet/proto/action/action";
import { PacketHighwayClient } from "@/core/packet/highway/client";
import { NTV2RichMediaResp } from "@/core/packet/proto/oidb/common/Ntv2.RichMediaResp";
import { OidbSvcTrpcTcpBaseRsp } from "@/core/packet/proto/oidb/OidbBase";
import { PacketMsgPicElement } from "@/core/packet/msg/element";
import { NTV2RichMediaHighwayExt } from "@/core/packet/proto/highway/highway";
import { int32ip2str, oidbIpv4s2HighwayIpv4s } from "@/core/packet/highway/utils";

export const BlockSize = 1024 * 1024;

interface HighwayServerAddr {
    ip: string
    port: number
}

export interface PacketHighwaySig {
    uin: string;
    sigSession: Uint8Array | null
    sessionKey: Uint8Array | null
    serverAddr: HighwayServerAddr[]
}

export class PacketHighwaySession {
    protected packetClient: PacketClient;
    protected packetHighwayClient: PacketHighwayClient;
    protected sig: PacketHighwaySig;
    protected logger: LogWrapper;
    protected packer: PacketPacker;
    private cachedPrepareReq: Promise<void> | null = null;

    constructor(logger: LogWrapper, client: PacketClient, packer: PacketPacker) {
        this.packetClient = client;
        this.logger = logger;
        this.sig = {
            uin: this.packetClient.napCatCore.selfInfo.uin,
            sigSession: null,
            sessionKey: null,
            serverAddr: [],
        };
        this.packer = packer;
        this.packetHighwayClient = new PacketHighwayClient(this.sig, this.logger);
    }

    private async checkAvailable() {
        if (!this.packetClient.available) {
            this.logger.logError('[Highway] packetServer not available!');
            throw new Error('packetServer不可用，请参照文档 https://napneko.github.io/config/advanced 检查packetServer状态或进行配置');
        }
        if (this.sig.sigSession === null || this.sig.sessionKey === null) {
            this.logger.logWarn('[Highway] sigSession or sessionKey not available!');
            if (this.cachedPrepareReq === null) {
                this.cachedPrepareReq = this.prepareUpload().finally(() => {
                    this.cachedPrepareReq = null;
                });
            }
            await this.cachedPrepareReq;
        }
    }

    private async prepareUpload(): Promise<void> {
        const packet = this.packer.packHttp0x6ff_501();
        const req = await this.packetClient.sendPacket('HttpConn.0x6ff_501', packet, true);
        const rsp = new NapProtoMsg(HttpConn0x6ff_501Response).decode(
            Buffer.from(req.hex_data, 'hex')
        );
        this.sig.sigSession = rsp.httpConn.sigSession;
        this.sig.sessionKey = rsp.httpConn.sessionKey;
        for (const info of rsp.httpConn.serverInfos) {
            if (info.serviceType !== 1) continue;
            for (const addr of info.serverAddrs) {
                this.logger.logDebug(`[Highway PrepareUpload] server addr add: ${int32ip2str(addr.ip)}:${addr.port}`);
                this.sig.serverAddr.push({
                    ip: int32ip2str(addr.ip),
                    port: addr.port
                });
            }
        }
    }

    async uploadImage(peer: Peer, img: PacketMsgPicElement): Promise<void> {
        await this.checkAvailable();
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupImageReq(Number(peer.peerUid), img);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CImageReq(peer.peerUid, img);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    private async uploadGroupImageReq(groupUin: number, img: PacketMsgPicElement): Promise<void> {
        const preReq = await this.packer.packUploadGroupImgReq(groupUin, img);
        const preRespRaw = await this.packetClient.sendPacket('OidbSvcTrpcTcp.0x11c4_100', preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] get upload ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: ukey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(preRespData.upload.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            });
            await this.packetHighwayClient.upload(
                1004,
                fs.createReadStream(img.path, { highWaterMark: BlockSize }),
                img.size,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] get upload invalid ukey ${ukey}, don't need upload!`);
        }
        img.msgInfo = preRespData.upload.msgInfo;
        // img.groupPicExt = new NapProtoMsg(CustomFace).decode(preRespData.tcpUpload.compatQMsg)
    }

    private async uploadC2CImageReq(peerUid: string, img: PacketMsgPicElement): Promise<void> {
        const preReq = await this.packer.packUploadC2CImgReq(peerUid, img);
        const preRespRaw = await this.packetClient.sendPacket('OidbSvcTrpcTcp.0x11c5_100', preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] get upload ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: ukey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(preRespData.upload.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            });
            await this.packetHighwayClient.upload(
                1003,
                fs.createReadStream(img.path, { highWaterMark: BlockSize }),
                img.size,
                md5,
                extend
            );
        }
        img.msgInfo = preRespData.upload.msgInfo;
    }
}
