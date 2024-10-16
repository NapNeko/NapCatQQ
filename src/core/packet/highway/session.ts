import * as fs from "node:fs";
import {LogWrapper} from "@/common/log";
import {PacketClient} from "@/core/packet/client";
import {PacketPacker} from "@/core/packet/packer";
import {NapProtoEncodeStructType, NapProtoMsg} from "@/core/packet/proto/NapProto";
import {HttpConn0x6ff_501Response} from "@/core/packet/proto/action/action";
import {PacketHighwayClient} from "@/core/packet/highway/client";
import {ChatType, Peer} from "@/core";
import {IPv4, NTV2RichMediaResp} from "@/core/packet/proto/oidb/common/Ntv2.RichMediaResp";
import {OidbSvcTrpcTcpBaseRsp} from "@/core/packet/proto/oidb/OidbBase";
import {PacketMsgPicElement} from "@/core/packet/msg/element";
import {NTHighwayIPv4, NTV2RichMediaHighwayExt} from "@/core/packet/proto/highway/highway";

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
    protected logger: LogWrapper;
    protected packer: PacketPacker;
    protected sig: PacketHighwaySig;
    protected packetHighwayClient: PacketHighwayClient;

    constructor(logger: LogWrapper, client: PacketClient) {
        this.packetClient = client;
        this.logger = logger;
        this.packer = new PacketPacker(logger);
        this.sig = {
            uin: this.packetClient.napCatCore.selfInfo.uin,
            sigSession: null,
            sessionKey: null,
            serverAddr: [],
        }
        this.packetHighwayClient = new PacketHighwayClient(this.sig, this.logger);
    }

    get available(): boolean {
        return this.packetClient.available && this.sig.sigSession !== null &&
            this.sig.sessionKey !== null && this.sig.serverAddr.length > 0;
    }

    private int32ip2str(ip: number) {
        ip = ip & 0xffffffff;
        return [ip & 0xff, (ip & 0xff00) >> 8, (ip & 0xff0000) >> 16, ((ip & 0xff000000) >> 24) & 0xff].join('.');
    }

    private oidbIpv4s2HighwayIpv4s(ipv4s: NapProtoEncodeStructType<typeof IPv4>[]): NapProtoEncodeStructType<typeof NTHighwayIPv4>[] {
        return ipv4s.map((ipv4) => {
            return {
                domain: {
                    isEnable: true,
                    ip: this.int32ip2str(ipv4.outIP!),
                }
            } as NapProtoEncodeStructType<typeof NTHighwayIPv4>
        })
    }

    // TODO: add signal to auto prepare when ready
    // TODO: refactor
    async prepareUpload(): Promise<void> {
        this.logger.log('[Highway] prepare tcpUpload!');
        const packet = this.packer.packHttp0x6ff_501();
        const req = await this.packetClient.sendPacket('HttpConn.0x6ff_501', packet, true);
        const u8RspData = Buffer.from(req.hex_data, 'hex');
        const rsp = new NapProtoMsg(HttpConn0x6ff_501Response).decode(u8RspData);
        this.sig.sigSession = rsp.httpConn.sigSession
        this.sig.sessionKey = rsp.httpConn.sessionKey
        // this.logger.log(`[Highway] sigSession ${Buffer.from(this.sigSession).toString('hex')},
        //  sessionKey ${Buffer.from(this.sessionKey).toString('hex')}`)
        for (const info of rsp.httpConn.serverInfos) {
            if (info.serviceType !== 1) continue;
            for (const addr of info.serverAddrs) {
                this.logger.log(`[Highway PrepareUpload] server addr add: ${this.int32ip2str(addr.ip)}:${addr.port}`);
                this.sig.serverAddr.push({
                    ip: this.int32ip2str(addr.ip),
                    port: addr.port
                })
            }
        }
    }

    private async uploadGroupImageReq(groupUin: number, img: PacketMsgPicElement): Promise<void> {
        if (!this.available) {
            this.logger.logError('[Highway] not ready to Upload image!');
            return;
        }
        const preReq = await this.packer.packUploadGroupImgReq(groupUin, img);
        const preRespRaw = await this.packetClient.sendPacket('OidbSvcTrpcTcp.0x11c4_100', preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.log(`[Highway] get upload ukey: ${ukey}, need upload!`);
            this.logger.log(preRespData.upload.msgInfo)
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: ukey,
                network: {
                    ipv4S: this.oidbIpv4s2HighwayIpv4s(preRespData.upload.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            })
            console.log('extend', Buffer.from(extend).toString('hex'))
            await this.packetHighwayClient.httpUpload(1004, fs.createReadStream(img.path,  { highWaterMark: BlockSize }), img.size, md5, extend);
        } else {
            this.logger.logError(`[Highway] get upload invalid ukey ${ukey}, don't need upload!`);
        }
        img.msgInfo = preRespData.upload.msgInfo;
        // img.groupPicExt = new NapProtoMsg(CustomFace).decode(preRespData.tcpUpload.compatQMsg)
    }

    async uploadImage(peer: Peer, img: PacketMsgPicElement): Promise<void> {
        await this.prepareUpload();
        if (!this.available) {
            this.logger.logError('[Highway] not ready to tcpUpload image!');
            return;
        }
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupImageReq(Number(peer.peerUid), img);
        }
        // const uploadReq
    }
}
