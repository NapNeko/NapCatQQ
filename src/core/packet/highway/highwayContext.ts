import { PacketHighwayClient } from '@/core/packet/highway/client';
import { PacketLogger } from '@/core/packet/context/loggerContext';
import FetchSessionKey from '@/core/packet/transformer/highway/FetchSessionKey';
import { int32ip2str, oidbIpv4s2HighwayIpv4s } from '@/core/packet/highway/utils';
import {
    PacketMsgFileElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgVideoElement
} from '@/core/packet/message/element';
import { ChatType, Peer } from '@/core';
import { calculateSha1, calculateSha1StreamBytes, computeMd5AndLengthWithLimit } from '@/core/packet/utils/crypto/hash';
import UploadGroupImage from '@/core/packet/transformer/highway/UploadGroupImage';
import { NapProtoMsg } from '@napneko/nap-proto-core';
import * as proto from '@/core/packet/transformer/proto';
import * as trans from '@/core/packet/transformer';
import fs from 'fs';
import { NapCoreContext } from '@/core/packet/context/napCoreContext';
import { PacketClientContext } from '@/core/packet/context/clientContext';

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

export class PacketHighwayContext {
    private readonly napcore: NapCoreContext;
    private readonly client: PacketClientContext;
    protected sig: PacketHighwaySig;
    protected logger: PacketLogger;
    protected hwClient: PacketHighwayClient;
    private cachedPrepareReq: Promise<void> | null = null;

    constructor(napcore: NapCoreContext, logger: PacketLogger, client: PacketClientContext) {
        this.napcore = napcore;
        this.client = client;
        this.sig = {
            uin: String(this.napcore.basicInfo.uin),
            uid: this.napcore.basicInfo.uid,
            sigSession: null,
            sessionKey: null,
            serverAddr: [],
        };
        this.logger = logger;
        this.hwClient = new PacketHighwayClient(this.sig, this.logger);
    }

    private async checkAvailable() {
        if (this.sig.sigSession === null || this.sig.sessionKey === null) {
            if (this.cachedPrepareReq === null) {
                this.cachedPrepareReq = this.prepareUpload().finally(() => {
                    this.cachedPrepareReq = null;
                });
            }
            await this.cachedPrepareReq;
        }
    }

    private async prepareUpload(): Promise<void> {
        this.logger.debug('[Highway] on prepareUpload!');
        const packet = FetchSessionKey.build();
        const req = await this.client.sendOidbPacket(packet, true);
        const rsp = FetchSessionKey.parse(req);
        this.sig.sigSession = rsp.httpConn.sigSession;
        this.sig.sessionKey = rsp.httpConn.sessionKey;
        for (const info of rsp.httpConn.serverInfos) {
            if (info.serviceType !== 1) continue;
            for (const addr of info.serverAddrs) {
                this.logger.debug(`[Highway PrepareUpload] server addr add: ${int32ip2str(addr.ip)}:${addr.port}`);
                this.sig.serverAddr.push({
                    ip: int32ip2str(addr.ip),
                    port: addr.port
                });
                this.hwClient.changeServer(int32ip2str(addr.ip), addr.port);
            }
        }
        if (this.sig.serverAddr.length === 0) {
            this.logger.warn('[Highway PrepareUpload] server addr is empty!');
        }
    }

    async uploadImage(peer: Peer, img: PacketMsgPicElement): Promise<void> {
        await this.checkAvailable();
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupImage(+peer.peerUid, img);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CImage(peer.peerUid, img);
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
            await this.uploadGroupVideo(+peer.peerUid, video);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CVideo(peer.peerUid, video);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    async uploadPtt(peer: Peer, ptt: PacketMsgPttElement): Promise<void> {
        await this.checkAvailable();
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupPtt(+peer.peerUid, ptt);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CPtt(peer.peerUid, ptt);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    async uploadFile(peer: Peer, file: PacketMsgFileElement): Promise<void> {
        await this.checkAvailable();
        if (peer.chatType === ChatType.KCHATTYPEGROUP) {
            await this.uploadGroupFile(+peer.peerUid, file);
        } else if (peer.chatType === ChatType.KCHATTYPEC2C) {
            await this.uploadC2CFile(peer.peerUid, file);
        } else {
            throw new Error(`[Highway] unsupported chatType: ${peer.chatType}`);
        }
    }

    private async uploadGroupImage(groupUin: number, img: PacketMsgPicElement): Promise<void> {
        img.sha1 = Buffer.from(await calculateSha1(img.path)).toString('hex');
        const req = UploadGroupImage.build(groupUin, img);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = UploadGroupImage.parse(resp);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != '') {
            this.logger.debug(`[Highway] uploadGroupImageReq get upload ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0]!.index;
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
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
            await this.hwClient.upload(
                1004,
                fs.createReadStream(img.path, { highWaterMark: BlockSize }),
                img.size,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadGroupImageReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        img.msgInfo = preRespData.upload.msgInfo;
        // img.groupPicExt = new NapProtoMsg(CustomFace).decode(preRespData.tcpUpload.compatQMsg)
    }

    private async uploadC2CImage(peerUid: string, img: PacketMsgPicElement): Promise<void> {
        img.sha1 = Buffer.from(await calculateSha1(img.path)).toString('hex');
        const req = trans.UploadPrivateImage.build(peerUid, img);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = trans.UploadPrivateImage.parse(resp);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != '') {
            this.logger.debug(`[Highway] uploadC2CImageReq get upload ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0]!.index;
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
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
            await this.hwClient.upload(
                1003,
                fs.createReadStream(img.path, { highWaterMark: BlockSize }),
                img.size,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadC2CImageReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        img.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadGroupVideo(groupUin: number, video: PacketMsgVideoElement): Promise<void> {
        if (!video.filePath || !video.thumbPath) throw new Error('video.filePath or video.thumbPath is empty');
        video.fileSha1 = Buffer.from(await calculateSha1(video.filePath)).toString('hex');
        video.thumbSha1 = Buffer.from(await calculateSha1(video.thumbPath)).toString('hex');
        const req = trans.UploadGroupVideo.build(groupUin, video);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = trans.UploadGroupVideo.parse(resp);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != '') {
            this.logger.debug(`[Highway] uploadGroupVideoReq get upload video ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0]!.index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: ukey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(preRespData.upload.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: await calculateSha1StreamBytes(video.filePath)
                }
            });
            await this.hwClient.upload(
                1005,
                fs.createReadStream(video.filePath, { highWaterMark: BlockSize }),
                +video.fileSize!,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadGroupVideoReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        const subFile = preRespData.upload.subFileInfos[0];
        if (subFile!.uKey && subFile!.uKey != '') {
            this.logger.debug(`[Highway] uploadGroupVideoReq get upload video thumb ukey: ${subFile!.uKey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[1]!.index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: subFile!.uKey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(subFile!.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            });
            await this.hwClient.upload(
                1006,
                fs.createReadStream(video.thumbPath, { highWaterMark: BlockSize }),
                +video.thumbSize!,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadGroupVideoReq get upload invalid thumb ukey ${subFile!.uKey}, don't need upload!`);
        }
        video.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadC2CVideo(peerUid: string, video: PacketMsgVideoElement): Promise<void> {
        if (!video.filePath || !video.thumbPath) throw new Error('video.filePath or video.thumbPath is empty');
        video.fileSha1 = Buffer.from(await calculateSha1(video.filePath)).toString('hex');
        video.thumbSha1 = Buffer.from(await calculateSha1(video.thumbPath)).toString('hex');
        const req = trans.UploadPrivateVideo.build(peerUid, video);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = trans.UploadPrivateVideo.parse(resp);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != '') {
            this.logger.debug(`[Highway] uploadC2CVideoReq get upload video ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0]!.index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: ukey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(preRespData.upload.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: await calculateSha1StreamBytes(video.filePath)
                }
            });
            await this.hwClient.upload(
                1001,
                fs.createReadStream(video.filePath, { highWaterMark: BlockSize }),
                +video.fileSize!,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadC2CVideoReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        const subFile = preRespData.upload.subFileInfos[0];
        if (subFile!.uKey && subFile!.uKey != '') {
            this.logger.debug(`[Highway] uploadC2CVideoReq get upload video thumb ukey: ${subFile!.uKey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[1]!.index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
                fileUuid: index.fileUuid,
                uKey: subFile!.uKey,
                network: {
                    ipv4S: oidbIpv4s2HighwayIpv4s(subFile!.ipv4S)
                },
                msgInfoBody: preRespData.upload.msgInfo.msgInfoBody,
                blockSize: BlockSize,
                hash: {
                    fileSha1: [sha1]
                }
            });
            await this.hwClient.upload(
                1002,
                fs.createReadStream(video.thumbPath, { highWaterMark: BlockSize }),
                +video.thumbSize!,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadC2CVideoReq get upload invalid thumb ukey ${subFile!.uKey}, don't need upload!`);
        }
        video.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadGroupPtt(groupUin: number, ptt: PacketMsgPttElement): Promise<void> {
        ptt.fileSha1 = Buffer.from(await calculateSha1(ptt.filePath)).toString('hex');
        const req = trans.UploadGroupPtt.build(groupUin, ptt);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = trans.UploadGroupPtt.parse(resp);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != '') {
            this.logger.debug(`[Highway] uploadGroupPttReq get upload ptt ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0]!.index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
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
            await this.hwClient.upload(
                1008,
                fs.createReadStream(ptt.filePath, { highWaterMark: BlockSize }),
                ptt.fileSize,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadGroupPttReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        ptt.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadC2CPtt(peerUid: string, ptt: PacketMsgPttElement): Promise<void> {
        ptt.fileSha1 = Buffer.from(await calculateSha1(ptt.filePath)).toString('hex');
        const req = trans.UploadPrivatePtt.build(peerUid, ptt);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = trans.UploadPrivatePtt.parse(resp);
        const ukey = preRespData.upload.uKey;
        if (ukey && ukey != '') {
            this.logger.debug(`[Highway] uploadC2CPttReq get upload ptt ukey: ${ukey}, need upload!`);
            const index = preRespData.upload.msgInfo.msgInfoBody[0]!.index;
            const md5 = Buffer.from(index.info.fileHash, 'hex');
            const sha1 = Buffer.from(index.info.fileSha1, 'hex');
            const extend = new NapProtoMsg(proto.NTV2RichMediaHighwayExt).encode({
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
            await this.hwClient.upload(
                1007,
                fs.createReadStream(ptt.filePath, { highWaterMark: BlockSize }),
                ptt.fileSize,
                md5,
                extend
            );
        } else {
            this.logger.debug(`[Highway] uploadC2CPttReq get upload invalid ukey ${ukey}, don't need upload!`);
        }
        ptt.msgInfo = preRespData.upload.msgInfo;
    }

    private async uploadGroupFile(groupUin: number, file: PacketMsgFileElement): Promise<void> {
        file.isGroupFile = true;
        file.fileMd5 = await computeMd5AndLengthWithLimit(file.filePath);
        file.fileSha1 = await calculateSha1(file.filePath);
        const req = trans.UploadGroupFile.build(groupUin, file);
        const resp = await this.client.sendOidbPacket(req, true);
        const preRespData = trans.UploadGroupFile.parse(resp);
        if (!preRespData?.upload?.boolFileExist) {
            this.logger.debug('[Highway] uploadGroupFileReq file not exist, need upload!');
            const ext = new NapProtoMsg(proto.FileUploadExt).encode({
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
                        appId: '100',
                        terminalType: 3,
                        clientVer: '1.1.1',
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
            });
            await this.hwClient.upload(
                71,
                fs.createReadStream(file.filePath, { highWaterMark: BlockSize }),
                file.fileSize,
                file.fileMd5,
                ext
            );
        } else {
            this.logger.debug('[Highway] uploadGroupFileReq file exist, don\'t need upload!');
        }
        file.fileUuid = preRespData.upload.fileId;
    }

    private async uploadC2CFile(peerUid: string, file: PacketMsgFileElement): Promise<void> {
        file.isGroupFile = false;
        file.fileMd5 = await computeMd5AndLengthWithLimit(file.filePath);
        file.fileSha1 = await calculateSha1(file.filePath);
        const req = await trans.UploadPrivateFile.build(this.sig.uid, peerUid, file);
        const res = await this.client.sendOidbPacket(req, true);
        const preRespData  = trans.UploadPrivateFile.parse(res);
        if (!preRespData.upload?.boolFileExist) {
            this.logger.debug('[Highway] uploadC2CFileReq file not exist, need upload!');
            const ext = new NapProtoMsg(proto.FileUploadExt).encode({
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
                        appId: '100',
                        terminalType: 3,
                        clientVer: '1.1.1',
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
            });
            await this.hwClient.upload(
                95,
                fs.createReadStream(file.filePath, { highWaterMark: BlockSize }),
                file.fileSize,
                file.fileMd5,
                ext
            );
        }
        file.fileUuid = preRespData.upload?.uuid;
        file.fileHash = preRespData.upload?.fileAddon;
        const fileExistReq = trans.DownloadOfflineFile.build(file.fileUuid!, file.fileHash!, this.sig.uid, peerUid);
        const fileExistRes = await this.client.sendOidbPacket(fileExistReq, true);
        file._e37_800_rsp = trans.DownloadOfflineFile.parse(fileExistRes);
        file._private_send_uid = this.sig.uid;
        file._private_recv_uid = peerUid;
    }
}
