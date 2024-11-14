import * as crypto from 'crypto';
import { PacketContext } from "@/core/packet/context/packetContext";
import * as trans from "@/core/packet/transformer";
import { PacketMsg } from "@/core/packet/message/message";
import {
    PacketMsgFileElement,
    PacketMsgPicElement,
    PacketMsgPttElement,
    PacketMsgVideoElement
} from "@/core/packet/message/element";
import { ChatType } from "@/core";
import { MiniAppRawData, MiniAppReqParams } from "@/core/packet/entities/miniApp";
import { AIVoiceChatType } from "@/core/packet/entities/aiChat";
import { NapProtoDecodeStructType, NapProtoEncodeStructType } from "@napneko/nap-proto-core";
import { IndexNode, MsgInfo } from "@/core/packet/transformer/proto";

export class PacketOperationContext {
    private readonly context: PacketContext;
    constructor(context: PacketContext) {
        this.context = context;
    }

    async GroupPoke(groupUin: number, uin: number) {
        const req = trans.SendPoke.build(groupUin, uin);
        await this.context.client.sendOidbPacket(req);
    }

    async FriendPoke(uin: number) {
        const req = trans.SendPoke.build(uin);
        await this.context.client.sendOidbPacket(req);
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
        } catch (e) {
            return undefined;
        }
    }

    async SetGroupSpecialTitle(groupUin: number, uid: string, tittle: string) {
        const req = trans.SetSpecialTitle.build(groupUin, uid, tittle);
        await this.context.client.sendOidbPacket(req);
    }

    async UploadResources(msg: PacketMsg[], groupUin: number = 0) {
        const reqList = [];
        for (const m of msg) {
            for (const e of m.msg) {
                if (e instanceof PacketMsgPicElement) {
                    reqList.push(this.context.highway.uploadImage({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.context.napcore.basicInfo.uid
                    }, e));
                }
                if (e instanceof PacketMsgVideoElement) {
                    reqList.push(this.context.highway.uploadVideo({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.context.napcore.basicInfo.uid
                    }, e));
                }
                if (e instanceof PacketMsgPttElement) {
                    reqList.push(this.context.highway.uploadPtt({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.context.napcore.basicInfo.uid
                    }, e));
                }
                if (e instanceof PacketMsgFileElement) {
                    reqList.push(this.context.highway.uploadFile({
                        chatType: groupUin ? ChatType.KCHATTYPEGROUP : ChatType.KCHATTYPEC2C,
                        peerUid: groupUin ? String(groupUin) : this.context.napcore.basicInfo.uid
                    }, e));
                }
            }
        }
        const res = await Promise.allSettled(reqList);
        this.context.logger.info(`上传资源${res.length}个，失败${res.filter(r => r.status === 'rejected').length}个`);
        res.forEach((result, index) => {
            if (result.status === 'rejected') {
                this.context.logger.error(`上传第${index + 1}个资源失败：${result.reason.stack}`);
            }
        });
    }

    async UploadForwardMsg(msg: PacketMsg[], groupUin: number = 0) {
        await this.UploadResources(msg, groupUin);
        const req = trans.UploadForwardMsg.build(this.context.napcore.basicInfo.uid, msg, groupUin);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.UploadForwardMsg.parse(resp);
        return res.result.resId;
    }

    async GetGroupFileUrl(groupUin: number, fileUUID: string) {
        const req = trans.DownloadGroupFile.build(groupUin, fileUUID);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadGroupFile.parse(resp);
        return `https://${res.download.downloadDns}/ftn_handler/${Buffer.from(res.download.downloadUrl).toString('hex')}/?fname=`;
    }

    async GetGroupPttUrl(groupUin: number, node: NapProtoEncodeStructType<typeof IndexNode>) {
        const req = trans.DownloadGroupPtt.build(groupUin, node);
        const resp = await this.context.client.sendOidbPacket(req, true);
        const res = trans.DownloadGroupPtt.parse(resp);
        return `https://${res.download.info.domain}${res.download.info.urlPath}${res.download.rKeyParam}`;
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
                voices: item.voices
            };
        });
    }

    async GetAiVoice(groupUin: number, voiceId: string, text: string, chatType: AIVoiceChatType): Promise<NapProtoDecodeStructType<typeof MsgInfo>> {
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
}
