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
import {
    PacketMsgFileElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgVideoElement
} from "@/core/packet/msg/element";
import { FileUploadExt, NTV2RichMediaHighwayExt } from "@/core/packet/proto/highway/highway";
import { int32ip2str, oidbIpv4s2HighwayIpv4s } from "@/core/packet/highway/utils";
import { calculateSha1, calculateSha1StreamBytes, computeMd5AndLengthWithLimit } from "@/core/packet/utils/crypto/hash";
import { OidbSvcTrpcTcp0x6D6Response } from "@/core/packet/proto/oidb/Oidb.0x6D6";
import { OidbSvcTrpcTcp0XE37_800Response, OidbSvcTrpcTcp0XE37Response } from "@/core/packet/proto/oidb/Oidb.0XE37_800";

export const BlockSize = 1024 * 1024;

interface HighwayServerAddr {
    ip: string
    port: number
}

export interface PacketHighwaySig {
    uin: string;
    uid: string;
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
            uid: this.packetClient.napCatCore.selfInfo.uid,
            sigSession: null,
            sessionKey: null,
            serverAddr: [],
        };
        this.packer = packer;
        this.packetHighwayClient = new PacketHighwayClient(this.sig, this.logger);
    }

    private async checkAvailable() {
        if (!this.packetClient.available) {
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
            await this.uploadGroupImageReq(+peer.peerUid, img);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CImageReq(peer.peerUid, img);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    async uploadVideo(peer: Peer, video: PacketMsgVideoElement): Promise<void> {
        await this.checkAvailable();
        if (+(video.fileSize ?? 0) > 1024 * 1024 * 100) {
            throw new Error(`[Highway] 视频文件过大: ${(+(video.fileSize ?? 0) / (1024 * 1024)).toFixed(2)} MB > 100 MB，请使用文件上传！`);
        }
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupVideoReq(+peer.peerUid, video);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CVideoReq(peer.peerUid, video);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    async uploadPtt(peer: Peer, ptt: PacketMsgPttElement): Promise<void> {
        await this.checkAvailable();
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupPttReq(+peer.peerUid, ptt);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CPttReq(peer.peerUid, ptt);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    async uploadFile(peer: Peer, file: PacketMsgFileElement): Promise<void> {
        await this.checkAvailable();
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupFileReq(+peer.peerUid, file);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CFileReq(peer.peerUid, file);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    private async uploadGroupImageReq(groupUin: number, img: PacketMsgPicElement): Promise<void> {
        img.sha1 = Buffer.from(await calculateSha1(img.path)).toString('hex');
        const preReq = await this.packer.packUploadGroupImgReq(groupUin, img);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] uploadGroupImageReq get upload ukey: ${ukey}, need upload!`);
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
                fs.createReadStream(img.path, {highWaterMark: BlockSize}),
                img.size,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadGroupImageReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        img.msgInfo = preRespData.upload.msgInfo;
        // img.groupPicExt = new NapProtoMsg(CustomFace).decode(preRespData.tcpUpload.compatQMsg)
    }

    private async uploadC2CImageReq(peerUid: string, img: PacketMsgPicElement): Promise<void> {
        img.sha1 = Buffer.from(await calculateSha1(img.path)).toString('hex');
        const preReq = await this.packer.packUploadC2CImgReq(peerUid, img);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] uploadC2CImageReq get upload ukey: ${ukey}, need upload!`);
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
                fs.createReadStream(img.path, {highWaterMark: BlockSize}),
                img.size,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadC2CImageReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        img.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadGroupVideoReq(groupUin: number, video: PacketMsgVideoElement): Promise<void> {
        if (!video.filePath || !video.thumbPath) throw new Error("video.filePath or video.thumbPath is empty");
        video.fileSha1 = Buffer.from(await calculateSha1(video.filePath)).toString('hex');
        video.thumbSha1 = Buffer.from(await calculateSha1(video.thumbPath)).toString('hex');
        const preReq = await this.packer.packUploadGroupVideoReq(groupUin, video);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] uploadGroupVideoReq get upload video ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
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
                    fileSha1: await calculateSha1StreamBytes(video.filePath!)
                }
            })
            await this.packetHighwayClient.upload(
                1005,
                fs.createReadStream(video.filePath!, {highWaterMark: BlockSize}),
                +video.fileSize!,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadGroupVideoReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        const subFile = preRespData.upload.subFileInfos[0];
        if (subFile.uKey && subFile.uKey != "") {
            this.logger.logDebug(`[Highway] uploadGroupVideoReq get upload video thumb ukey: ${subFile.uKey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[1].index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const extend = new NapProtoMsg(NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: subFile.uKey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(subFile.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            });
            await this.packetHighwayClient.upload(
                1006,
                fs.createReadStream(video.thumbPath!, {highWaterMark: BlockSize}),
                +video.thumbSize!,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadGroupVideoReq get upload invalid thumb ukey ${subFile.uKey}, don't need upload!`);
        }
        video.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadC2CVideoReq(peerUid: string, video: PacketMsgVideoElement): Promise<void> {
        if (!video.filePath || !video.thumbPath) throw new Error("video.filePath or video.thumbPath is empty");
        video.fileSha1 = Buffer.from(await calculateSha1(video.filePath)).toString('hex');
        video.thumbSha1 = Buffer.from(await calculateSha1(video.thumbPath)).toString('hex');
        const preReq = await this.packer.packUploadC2CVideoReq(peerUid, video);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] uploadC2CVideoReq get upload video ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
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
                    fileSha1: await calculateSha1StreamBytes(video.filePath!)
                }
            })
            await this.packetHighwayClient.upload(
                1001,
                fs.createReadStream(video.filePath!, {highWaterMark: BlockSize}),
                +video.fileSize!,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadC2CVideoReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        const subFile = preRespData.upload.subFileInfos[0];
        if (subFile.uKey && subFile.uKey != "") {
            this.logger.logDebug(`[Highway] uploadC2CVideoReq get upload video thumb ukey: ${subFile.uKey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[1].index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const extend = new NapProtoMsg(NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: subFile.uKey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(subFile.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            });
            await this.packetHighwayClient.upload(
                1002,
                fs.createReadStream(video.thumbPath!, {highWaterMark: BlockSize}),
                +video.thumbSize!,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadC2CVideoReq get upload invalid thumb ukey ${subFile.uKey}, don't need upload!`);
        }
        video.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadGroupPttReq(groupUin: number, ptt: PacketMsgPttElement): Promise<void> {
        ptt.fileSha1 = Buffer.from(await calculateSha1(ptt.filePath)).toString('hex');
        const preReq = await this.packer.packUploadGroupPttReq(groupUin, ptt);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] uploadGroupPttReq get upload ptt ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
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
            })
            await this.packetHighwayClient.upload(
                1008,
                fs.createReadStream(ptt.filePath, {highWaterMark: BlockSize}),
                ptt.fileSize,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadGroupPttReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        ptt.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadC2CPttReq(peerUid: string, ptt: PacketMsgPttElement): Promise<void> {
        ptt.fileSha1 = Buffer.from(await calculateSha1(ptt.filePath)).toString('hex');
        const preReq = await this.packer.packUploadC2CPttReq(peerUid, ptt);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(NTV2RichMediaResp).decode(preResp.body);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != "") {
            this.logger.logDebug(`[Highway] uploadC2CPttReq get upload ptt ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0].index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
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
            })
            await this.packetHighwayClient.upload(
                1007,
                fs.createReadStream(ptt.filePath, {highWaterMark: BlockSize}),
                ptt.fileSize,
                md5,
                extend
            );
        } else {
            this.logger.logDebug(`[Highway] uploadC2CPttReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        ptt.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadGroupFileReq(groupUin: number, file: PacketMsgFileElement): Promise<void> {
        file.isGroupFile = true;
        file.fileMd5 = await computeMd5AndLengthWithLimit(file.filePath);
        file.fileSha1 = await calculateSha1(file.filePath);
        const preReq = await this.packer.packUploadGroupFileReq(groupUin, file);
        const preRespRaw = await this.packetClient.sendOidbPacket(preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(OidbSvcTrpcTcp0x6D6Response).decode(preResp.body);
        if (!preRespData?.upload?.boolFileExist) {
            this.logger.logDebug(`[Highway] uploadGroupFileReq file not exist, need upload!`);
            const ext = new NapProtoMsg(FileUploadExt).encode({
                unknown1: 100,
                unknown2: 1,
                entry: {
                    busiBuff: {
                        senderUin: BigInt(this.sig.uin),
                        receiverUin: BigInt(groupUin),
                        groupCode: BigInt(groupUin),
                    },
                    fileEntry: {
                        fileSize: BigInt(file.fileSize),
                        md5: file.fileMd5,
                        md5S2: file.fileMd5,
                        checkKey: preRespData.upload.checkKey,
                        fileId: preRespData.upload.fileId,
                        uploadKey: preRespData.upload.fileKey,
                    },
                    clientInfo: {
                        clientType: 3,
                        appId: "100",
                        terminalType: 3,
                        clientVer: "1.1.1",
                        unknown: 4
                    },
                    fileNameInfo: {
                        fileName: file.fileName
                    },
                    host: {
                        hosts: [
                            {
                                url: {
                                    host: preRespData.upload.uploadIp,
                                    unknown: 1,
                                },
                                port: preRespData.upload.uploadPort,
                            }
                        ]
                    }
                },
                unknown200: 0,
            })
            await this.packetHighwayClient.upload(
                71,
                fs.createReadStream(file.filePath, {highWaterMark: BlockSize}),
                file.fileSize,
                file.fileMd5,
                ext
            );
        } else {
            this.logger.logDebug(`[Highway] uploadGroupFileReq file exist, don't need upload!`);
        }
        file.fileUuid = preRespData.upload.fileId;
    }

    private async uploadC2CFileReq(peerUid: string, file: PacketMsgFileElement): Promise<void> {
        file.isGroupFile = false;
        file.fileMd5 = await computeMd5AndLengthWithLimit(file.filePath);
        file.fileSha1 = await calculateSha1(file.filePath);
        const preReq = await this.packer.packUploadC2CFileReq(this.sig.uid, peerUid, file);
        const preRespRaw = await this.packetClient.sendOidbPacket( preReq, true);
        const preResp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(
            Buffer.from(preRespRaw.hex_data, 'hex')
        );
        const preRespData = new NapProtoMsg(OidbSvcTrpcTcp0XE37Response).decode(preResp.body);
        if (!preRespData.upload?.boolFileExist) {
            this.logger.logDebug(`[Highway] uploadC2CFileReq file not exist, need upload!`);
            const ext = new NapProtoMsg(FileUploadExt).encode({
                unknown1: 100,
                unknown2: 1,
                entry: {
                    busiBuff: {
                        senderUin: BigInt(this.sig.uin),
                    },
                    fileEntry: {
                        fileSize: BigInt(file.fileSize),
                        md5: file.fileMd5,
                        md5S2: file.fileMd5,
                        checkKey: file.fileSha1,
                        fileId: preRespData.upload?.uuid,
                        uploadKey: preRespData.upload?.mediaPlatformUploadKey,
                    },
                    clientInfo: {
                        clientType: 3,
                        appId: "100",
                        terminalType: 3,
                        clientVer: "1.1.1",
                        unknown: 4
                    },
                    fileNameInfo: {
                        fileName: file.fileName
                    },
                    host: {
                        hosts: [
                            {
                                url: {
                                    host: preRespData.upload?.uploadIp,
                                    unknown: 1,
                                },
                                port: preRespData.upload?.uploadPort,
                            }
                        ]
                    }
                },
                unknown200: 1,
                unknown3: 0
            })
            await this.packetHighwayClient.upload(
                95,
                fs.createReadStream(file.filePath, {highWaterMark: BlockSize}),
                file.fileSize,
                file.fileMd5,
                ext
            );
        }
        file.fileUuid = preRespData.upload?.uuid;
        file.fileHash = preRespData.upload?.fileAddon;
        const FetchExistFileReq = this.packer.packOfflineFileDownloadReq(file.fileUuid!, file.fileHash!, this.sig.uid, peerUid);
        const resp = await this.packetClient.sendOidbPacket(FetchExistFileReq, true);
        const oidb_resp = new NapProtoMsg(OidbSvcTrpcTcpBaseRsp).decode(Buffer.from(resp.hex_data, 'hex'));
        file._e37_800_rsp = new NapProtoMsg(OidbSvcTrpcTcp0XE37_800Response).decode(oidb_resp.body);
        file._private_send_uid = this.sig.uid;
        file._private_recv_uid = peerUid;
    }
}
