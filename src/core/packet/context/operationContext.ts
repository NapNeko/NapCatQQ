import * as crypto from 'crypto';
import { PacketContext } from '@/core/packet/context/packetContext';
import * as trans from '@/core/packet/transformer';
import { PacketMsg } from '@/core/packet/message/message';
import {
    PacketMsgFileElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgReplyElement,
    PacketMsgVideoElement,
} from '@/core/packet/message/element';
import { ChatType, MsgSourceType, NTMsgType, RawMessage } from '@/core';
import { MiniAppRawData, MiniAppReqParams } from '@/core/packet/entities/miniApp';
import { AIVoiceChatType } from '@/core/packet/entities/aiChat';
import { NapProtoDecodeStructType, NapProtoEncodeStructType, NapProtoMsg } from '@napneko/nap-proto-core';
import { IndexNode, LongMsgResult, MsgInfo, PushMsgBody } from '@/core/packet/transformer/proto';
import { OidbPacket } from '@/core/packet/transformer/base';
import { ImageOcrResult } from '@/core/packet/entities/ocrResult';
import { gunzipSync } from 'zlib';
import { PacketMsgConverter } from '@/core/packet/message/converter';

export class PacketOperationContext {
    private readonly context: PacketContext;

    constructor(context: PacketContext) {
        this.context = context;
    }

    async sendPacket<T extends boolean = false>(pkt: OidbPacket, rsp?: T): Promise<T extends true ? Buffer : void> {
        return await this.context.client.sendOidbPacket(pkt, rsp);
    }

    async SendPoke(is_group: boolean, peer: number, target?: number) {
        const req = trans.SendPoke.build(is_group, peer, target ?? peer);
        await this.context.client.sendOidbPacket(req);
    }
    async SetGroupTodo(groupUin: number, msgSeq: string) {
        const req = trans.SetGroupTodo.build(groupUin, msgSeq);
        await this.context.client.sendOidbPacket(req, true);
    }
    async FetchRkey() {
        const req = trans.FetchRkey.build();
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.FetchRkey.parse(resp);
        return res.data.rkeyList;
    }

    async GroupSign(groupUin: number) {
        const req = trans.GroupSign.build(this.context.napcore.basicInfo.uin, groupUin);
        await this.context.client.sendOidbPacket(req);
    }

    async GetStrangerStatus(uin: number) {
        let status = 0;
        try {
            const req = trans.GetStrangerInfo.build(uin);
            const resp = await this.context.client.sendOidbPacket(req, true);
            const res = trans.GetStrangerInfo.parse(resp);
            const extBigInt = BigInt(res.data.status.value);
            if (extBigInt <= 10n) {
                return { status: Number(extBigInt) * 10, ext_status: 0 };
            }
            status = Number((extBigInt & 0xff00n) + ((extBigInt >> 16n) & 0xffn));
            return { status: 10, ext_status: status };
        } catch {
            return undefined;
        }
    }

    async SetGroupSpecialTitle(groupUin: number, uid: string, title: string) {
        const req = trans.SetSpecialTitle.build(groupUin, uid, title);
        await this.context.client.sendOidbPacket(req);
    }

    async UploadResources(msg: PacketMsg[], groupUin: number = 0) {
        const chatType = groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C;
        const peerUid = groupUin ? String(groupUin) : this.context.napcore.basicInfo.uid;
        const reqList = msg.flatMap((m) =>
            m.msg
                .map((e) => {
                    if (e instanceof PacketMsgPicElement) {
                        return this.context.highway.uploadImage({ chatType, peerUid }, e);
                    } else if (e instanceof PacketMsgVideoElement) {
                        return this.context.highway.uploadVideo({ chatType, peerUid }, e);
                    } else if (e instanceof PacketMsgPttElement) {
                        return this.context.highway.uploadPtt({ chatType, peerUid }, e);
                    } else if (e instanceof PacketMsgFileElement) {
                        return this.context.highway.uploadFile({ chatType, peerUid }, e);
                    }
                    return null;
                })
                .filter(Boolean)
        );
        const res = await Promise.allSettled(reqList);
        this.context.logger.info(`上传资源${res.length}个，失败${res.filter((r) => r.status === 'rejected').length}个`);
        res.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.context.logger.error(`上传第${index + 1}个资源失败：${result.reason.stack}`);
            }
        });
    }

    async UploadImage(img: PacketMsgPicElement) {
        await this.context.highway.uploadImage(
            {
                chatType: ChatType.KCHATTYPEC2C,
                peerUid: this.context.napcore.basicInfo.uid,
            },
            img
        );
        const index = img.msgInfo?.msgInfoBody?.at(0)?.index;
        if (!index) {
            throw new Error('img.msgInfo?.msgInfoBody![0].index! is undefined');
        }
        return await this.GetImageUrl(this.context.napcore.basicInfo.uid, index);
    }

    async GetImageUrl(selfUid: string, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadImage.build(selfUid, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadImage.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
    }

    async GetPttUrl(selfUid: string, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadPtt.build(selfUid, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadPtt.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
    }

    async GetVideoUrl(selfUid: string, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadVideo.build(selfUid, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadVideo.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
    }

    async GetGroupImageUrl(groupUin: number, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadGroupImage.build(groupUin, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadImage.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
    }

    async GetGroupPttUrl(groupUin: number, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadGroupPtt.build(groupUin, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadImage.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
    }

    async GetGroupVideoUrl(groupUin: number, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadGroupVideo.build(groupUin, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadImage.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
    }


    async ImageOCR(imgUrl: string) {
        const req = trans.ImageOCR.build(imgUrl);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.ImageOCR.parse(resp);
        return {
            texts: res.ocrRspBody.textDetections.map((item) => {
                return {
                    text: item.detectedText,
                    confidence: item.confidence,
                    coordinates: item.polygon.coordinates.map((c) => {
                        return {
                            x: c.x,
                            y: c.y,
                        };
                    }),
                };
            }),
            language: res.ocrRspBody.language,
        } as ImageOcrResult;
    }

    private async SendPreprocess(msg: PacketMsg[], groupUin: number = 0) {
        const ps = msg.map((m) => {
            return m.msg.map(async (e) => {
                if (e instanceof PacketMsgReplyElement && !e.targetElems) {
                    this.context.logger.debug(`Cannot find reply element's targetElems, prepare to fetch it...`);
                    if (!e.targetPeer?.peerUid) {
                        this.context.logger.error(`targetPeer is undefined!`);
                    }
                    let targetMsg: NapProtoEncodeStructType<typeof PushMsgBody>[] | undefined;
                    if (e.isGroupReply) {
                        targetMsg = await this.FetchGroupMessage(+(e.targetPeer?.peerUid ?? 0), e.targetMessageSeq, e.targetMessageSeq);
                    } else {
                        targetMsg = await this.FetchC2CMessage(await this.context.napcore.basicInfo.uin2uid(e.targetUin), e.targetMessageSeq, e.targetMessageSeq);
                    }
                    e.targetElems = targetMsg.at(0)?.body?.richText?.elems;
                    e.targetSourceMsg = targetMsg.at(0);
                }
            });
        }).flat();
        await Promise.all(ps)
        await this.UploadResources(msg, groupUin);
    }

    async FetchGroupMessage(groupUin: number, startSeq: number, endSeq: number): Promise<NapProtoDecodeStructType<typeof PushMsgBody>[]> {
        const req = trans.FetchGroupMessage.build(groupUin, startSeq, endSeq);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.FetchGroupMessage.parse(resp);
        return res.body.messages
    }

    async FetchC2CMessage(targetUid: string, startSeq: number, endSeq: number): Promise<NapProtoDecodeStructType<typeof PushMsgBody>[]> {
        const req = trans.FetchC2CMessage.build(targetUid, startSeq, endSeq);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.FetchC2CMessage.parse(resp);
        return res.messages
    }

    async UploadForwardMsg(msg: PacketMsg[], groupUin: number = 0) {
        await this.SendPreprocess(msg, groupUin);
        const req = trans.UploadForwardMsg.build(this.context.napcore.basicInfo.uid, msg, groupUin);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.UploadForwardMsg.parse(resp);
        return res.result.resId;
    }

    async MoveGroupFile(
        groupUin: number,
        fileUUID: string,
        currentParentDirectory: string,
        targetParentDirectory: string
    ) {
        const req = trans.MoveGroupFile.build(groupUin, fileUUID, currentParentDirectory, targetParentDirectory);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.MoveGroupFile.parse(resp);
        return res.move.retCode;
    }

    async RenameGroupFile(groupUin: number, fileUUID: string, currentParentDirectory: string, newName: string) {
        const req = trans.RenameGroupFile.build(groupUin, fileUUID, currentParentDirectory, newName);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.RenameGroupFile.parse(resp);
        return res.rename.retCode;
    }

    async GetGroupFileUrl(groupUin: number, fileUUID: string) {
        const req = trans.DownloadGroupFile.build(groupUin, fileUUID);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadGroupFile.parse(resp);
        return `https://${res.download.downloadDns}/ftn_handler/${Buffer.from(res.download.downloadUrl).toString('hex')}/?fname=`;
    }

    async GetPrivateFileUrl(self_id: string, fileUUID: string, md5: string) {
        const req = trans.DownloadPrivateFile.build(self_id, fileUUID, md5);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadPrivateFile.parse(resp);
        return `http://${res.body?.result?.server}:${res.body?.result?.port}${res.body?.result?.url?.slice(8)}&isthumb=0`;
    }

    async GetMiniAppAdaptShareInfo(param: MiniAppReqParams) {
        const req = trans.GetMiniAppAdaptShareInfo.build(param);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.GetMiniAppAdaptShareInfo.parse(resp);
        return JSON.parse(res.content.jsonContent) as MiniAppRawData;
    }

    async FetchAiVoiceList(groupUin: number, chatType: AIVoiceChatType) {
        const req = trans.FetchAiVoiceList.build(groupUin, chatType);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.FetchAiVoiceList.parse(resp);
        if (!res.content) return null;
        return res.content.map((item) => {
            return {
                category: item.category,
                voices: item.voices,
            };
        });
    }

    async GetAiVoice(
        groupUin: number,
        voiceId: string,
        text: string,
        chatType: AIVoiceChatType
    ): Promise<NapProtoDecodeStructType<typeof MsgInfo>> {
        let reqTime = 0;
        const reqMaxTime = 30;
        const sessionId = crypto.randomBytes(4).readUInt32BE(0);
        while (true) {
            if (reqTime >= reqMaxTime) {
                throw new Error(`sendAiVoiceChatReq failed after ${reqMaxTime} times`);
            }
            reqTime++;
            const req = trans.GetAiVoice.build(groupUin, voiceId, text, sessionId, chatType);
            const resp = await this.context.client.sendOidbPacket(req, true);
            const res = trans.GetAiVoice.parse(resp);
            if (!res.msgInfo) continue;
            return res.msgInfo;
        }
    }

    async FetchForwardMsg(res_id: string): Promise<RawMessage[]> {
        const req = trans.DownloadForwardMsg.build(this.context.napcore.basicInfo.uid, res_id);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadForwardMsg.parse(resp);
        const inflate = gunzipSync(res.result.payload);
        const result = new NapProtoMsg(LongMsgResult).decode(inflate);

        const main = result.action.find((r) => r.actionCommand === 'MultiMsg');
        if (!main?.actionData.msgBody) {
            throw new Error('msgBody is empty');
        }
        this.context.logger.debug('rawChains ', inflate.toString('hex'));

        const messagesPromises = main.actionData.msgBody.map(async (msg) => {
            if (!msg?.body?.richText?.elems) {
                throw new Error('msg.body.richText.elems is empty');
            }
            const rawChains = new PacketMsgConverter().packetMsgToRaw(msg?.body?.richText?.elems);
            const elements = await Promise.all(
                rawChains.map(async ([element, rawElem]) => {
                    if (element.picElement && rawElem?.commonElem?.pbElem) {
                        const extra = new NapProtoMsg(MsgInfo).decode(rawElem.commonElem.pbElem);
                        const index = extra?.msgInfoBody[0]?.index;
                        if (msg?.responseHead.grp !== undefined) {
                            const groupUin = msg?.responseHead.grp?.groupUin ?? 0;
                            element.picElement = {
                                ...element.picElement,
                                originImageUrl: await this.GetGroupImageUrl(groupUin, index!),
                            };
                        } else {
                            element.picElement = {
                                ...element.picElement,
                                originImageUrl: await this.GetImageUrl(this.context.napcore.basicInfo.uid, index!),
                            };
                        }
                        return element;
                    }
                    return element;
                })
            );
            return {
                chatType: ChatType.KCHATTYPEGROUP,
                elements: elements,
                guildId: '',
                isOnlineMsg: false,
                msgId: '7467703692092974645', // TODO: no necessary
                msgRandom: '0',
                msgSeq: String(msg.contentHead.sequence ?? 0),
                msgTime: String(msg.contentHead.timeStamp ?? 0),
                msgType: NTMsgType.KMSGTYPEMIX,
                parentMsgIdList: [],
                parentMsgPeer: {
                    chatType: ChatType.KCHATTYPEGROUP,
                    peerUid: String(msg?.responseHead.grp?.groupUin ?? 0),
                },
                peerName: '',
                peerUid: '1094950020',
                peerUin: '1094950020',
                recallTime: '0',
                records: [],
                sendNickName: msg?.responseHead.grp?.memberName ?? '',
                sendRemarkName: msg?.responseHead.grp?.memberName ?? '',
                senderUid: '',
                senderUin: '1094950020',
                sourceType: MsgSourceType.K_DOWN_SOURCETYPE_UNKNOWN,
                subMsgType: 1,
            };
        });
        return await Promise.all(messagesPromises);
    }
}
