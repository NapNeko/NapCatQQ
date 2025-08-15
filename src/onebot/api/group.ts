import {
    ChatType,
    FileElement,
    GrayTipElement,
    InstanceContext,
    JsonGrayBusiId,
    MessageElement,
    NapCatCore,
    NTGrayTipElementSubTypeV2,
    RawMessage,
    TipGroupElement,
    TipGroupElementType,
} from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11GroupBanEvent } from '@/onebot/event/notice/OB11GroupBanEvent';
import fastXmlParser from 'fast-xml-parser';
import { OB11GroupMsgEmojiLikeEvent } from '@/onebot/event/notice/OB11MsgEmojiLikeEvent';
import { MessageUnique } from '@/common/message-unique';
import { OB11GroupCardEvent } from '@/onebot/event/notice/OB11GroupCardEvent';
import { OB11GroupPokeEvent } from '@/onebot/event/notice/OB11PokeEvent';
import { OB11GroupEssenceEvent } from '@/onebot/event/notice/OB11GroupEssenceEvent';
import { OB11GroupTitleEvent } from '@/onebot/event/notice/OB11GroupTitleEvent';
import { OB11GroupUploadNoticeEvent } from '../event/notice/OB11GroupUploadNoticeEvent';
import { OB11GroupNameEvent } from '../event/notice/OB11GroupNameEvent';
import { FileNapCatOneBotUUID } from '@/common/file-uuid';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';

export class OneBotGroupApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;
    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    async parseGroupBanEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        const groupElement = grayTipElement?.groupElement;
        if (!groupElement?.shutUp) return undefined;
        const memberUid = groupElement.shutUp.member.uid;
        const adminUid = groupElement.shutUp.admin.uid;
        let memberUin: string;
        let duration = parseInt(groupElement.shutUp.duration);
        const subType: 'ban' | 'lift_ban' = duration > 0 ? 'ban' : 'lift_ban';
        if (memberUid) {
            memberUin = (await this.core.apis.GroupApi.getGroupMember(GroupCode, memberUid))?.uin ?? '';
        } else {
            memberUin = '0';  // 0表示全员禁言
            if (duration > 0) {
                duration = -1;
            }
        }
        await this.core.apis.GroupApi.refreshGroupMemberCachePartial(GroupCode, memberUid);
        const adminUin = (await this.core.apis.GroupApi.getGroupMember(GroupCode, adminUid))?.uin;
        if (memberUin && adminUin) {
            return new OB11GroupBanEvent(
                this.core,
                parseInt(GroupCode),
                parseInt(memberUin),
                parseInt(adminUin),
                duration,
                subType,
            );
        }
        return undefined;
    }

    async parseGroupEmojiLikeEventByGrayTip(
        groupCode: string,
        grayTipElement: GrayTipElement
    ) {
        const emojiLikeData = new fastXmlParser.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
        }).parse(grayTipElement.xmlElement.content);
        this.core.context.logger.logDebug('收到表情回应我的消息', emojiLikeData);
        const senderUin = emojiLikeData.gtip.qq.jp;
        const msgSeq = emojiLikeData.gtip.url.msgseq;
        const emojiId = emojiLikeData.gtip.face.id;
        return await this.createGroupEmojiLikeEvent(groupCode, senderUin, msgSeq, emojiId);
    }

    async createGroupEmojiLikeEvent(
        groupCode: string,
        senderUin: string,
        msgSeq: string,
        emojiId: string,
    ) {
        const peer = {
            chatType: ChatType.KCHATTYPEGROUP,
            guildId: '',
            peerUid: groupCode,
        };
        const replyMsgList = (await this.core.apis.MsgApi.queryFirstMsgBySeq(peer, msgSeq)).msgList;
        if (replyMsgList.length < 1) {
            return;
        }
        const replyMsg = replyMsgList[0];
        if (!replyMsg) {
            this.core.context.logger.logError('解析表情回应消息失败: 未找到回应消息');
            return undefined;
        }
        return new OB11GroupMsgEmojiLikeEvent(
            this.core,
            parseInt(groupCode),
            parseInt(senderUin),
            MessageUnique.getShortIdByMsgId(replyMsg.msgId)!,
            [{
                emoji_id: emojiId,
                count: 1,
            }],
        );
    }

    async parseCardChangedEvent(msg: RawMessage) {
        if (msg.senderUin && msg.senderUin !== '0') {
            const member = await this.core.apis.GroupApi.getGroupMember(msg.peerUid, msg.senderUin);
            if (member && member.cardName !== msg.sendMemberName) {
                const newCardName = msg.sendMemberName ?? '';
                const event = new OB11GroupCardEvent(this.core, parseInt(msg.peerUid), parseInt(msg.senderUin), newCardName, member.cardName);
                member.cardName = newCardName;
                return event;
            }
            if (member && member.nick !== msg.sendNickName) {
                await this.core.apis.GroupApi.refreshGroupMemberCachePartial(msg.peerUid, msg.senderUid);
            }
        }
        return undefined;
    }

    async parsePaiYiPai(msg: RawMessage, jsonStr: string) {
        const json = JSON.parse(jsonStr);
        //判断业务类型
        //Poke事件
        const pokedetail: Array<{ uid: string }> = json.items;
        //筛选item带有uid的元素
        const poke_uid = pokedetail.filter(item => item.uid);
        if (poke_uid.length == 2 && poke_uid[0]?.uid && poke_uid[1]?.uid) {
            return new OB11GroupPokeEvent(
                this.core,
                parseInt(msg.peerUid),
                +await this.core.apis.UserApi.getUinByUidV2(poke_uid[0].uid),
                +await this.core.apis.UserApi.getUinByUidV2(poke_uid[1].uid),
                pokedetail,
            );
        }
        return undefined;
    }

    async parseOtherJsonEvent(msg: RawMessage, jsonStr: string, context: InstanceContext) {
        const json = JSON.parse(jsonStr);
        const type = json.items[json.items.length - 1]?.txt;
        await this.core.apis.GroupApi.refreshGroupMemberCachePartial(msg.peerUid, msg.senderUid);
        if (type === '头衔') {
            const memberUin = json.items[1].param[0];
            const title = json.items[3].txt;
            context.logger.logDebug('收到群成员新头衔消息', json);
            return new OB11GroupTitleEvent(
                this.core,
                +msg.peerUid,
                +memberUin,
                title,
            );
        } else if (type === '移出') {
            context.logger.logDebug('收到机器人被踢消息', json);
            return;
        } else {
            context.logger.logWarn('收到未知的灰条消息', json);
        }
        return;
    }

    async parseEssenceMsg(msg: RawMessage, jsonStr: string) {
        const json = JSON.parse(jsonStr);
        const searchParams = new URL(json.items[0].jp).searchParams;
        const msgSeq = searchParams.get('msgSeq')!;
        const Group = searchParams.get('groupCode');
        if (!Group) return;
        // const businessId = searchParams.get('businessid');
        const Peer = {
            guildId: '',
            chatType: ChatType.KCHATTYPEGROUP,
            peerUid: Group,
        };
        const msgData = await this.core.apis.MsgApi.getMsgsBySeqAndCount(Peer, msgSeq.toString(), 1, true, true);
        const msgList = (await this.core.apis.WebApi.getGroupEssenceMsgAll(Group)).flatMap((e) => e.data.msg_list);
        const realMsg = msgList.find((e) => e.msg_seq.toString() == msgSeq);
        if (msgData.msgList[0]) {
            return new OB11GroupEssenceEvent(
                this.core,
                parseInt(msg.peerUid),
                MessageUnique.getShortIdByMsgId(msgData.msgList[0].msgId)!,
                parseInt(msgData.msgList[0].senderUin ?? await this.core.apis.UserApi.getUinByUidV2(msgData.msgList[0].senderUid)),
                parseInt(realMsg?.add_digest_uin ?? '0'),
            );
        }
        return;
        // 获取MsgSeq+Peer可获取具体消息
    }

    async parseGroupUploadFileEvene(msg: RawMessage, element: FileElement, elementWrapper: MessageElement) {
        return new OB11GroupUploadNoticeEvent(
            this.core,
            parseInt(msg.peerUid), parseInt(msg.senderUin || ''),
            {
                id: FileNapCatOneBotUUID.encode({
                    chatType: ChatType.KCHATTYPEGROUP,
                    peerUid: msg.peerUid,
                }, msg.msgId, elementWrapper.elementId, elementWrapper?.fileElement?.fileUuid, element.fileMd5 ?? element.fileUuid),
                name: element.fileName,
                size: parseInt(element.fileSize),
                busid: element.fileBizId ?? 0,
            },
        );
    }

    async parseGroupElement(msg: RawMessage, element: TipGroupElement, elementWrapper: GrayTipElement) {
        if (element.type === TipGroupElementType.KGROUPNAMEMODIFIED) {
            this.core.context.logger.logDebug('收到群名称变更事件', element);
            return new OB11GroupNameEvent(
                this.core,
                parseInt(msg.peerUid),
                parseInt(await this.core.apis.UserApi.getUinByUidV2(element.memberUid)),
                element.groupName,
            );
        } else if (element.type === TipGroupElementType.KSHUTUP) {
            const event = await this.parseGroupBanEvent(msg.peerUid, elementWrapper);
            return event;
        } else if (element.type === TipGroupElementType.KMEMBERADD) {
            // 自己的通知 协议推送为type->85 在这里实现为了避免邀请出现问题
            if (element.memberUid == this.core.selfInfo.uid) {
                await this.core.apis.GroupApi.refreshGroupMemberCache(msg.peerUid, true);
                return new OB11GroupIncreaseEvent(
                    this.core,
                    parseInt(msg.peerUid),
                    +this.core.selfInfo.uin,
                    element.adminUid ? +await this.core.apis.UserApi.getUinByUidV2(element.adminUid) : 0,
                    'approve'
                );
            }
        }
        return;
    }

    async parseSelfInviteEvent(msg: RawMessage, inviterUin: string, inviteeUin: string) {
        return new OB11GroupIncreaseEvent(
            this.core,
            parseInt(msg.peerUid),
            +inviteeUin,
            +inviterUin,
            'invite'
        );
    }
    async parse51TypeEvent(msg: RawMessage, grayTipElement: GrayTipElement) {
        // 神经腾讯 没了妈妈想出来的
        // Warn 下面存在高并发危险
        if (grayTipElement.jsonGrayTipElement.jsonStr) {
            const json: {
                align: string,
                items: Array<{ txt: string, type: string }>
            } = JSON.parse(grayTipElement.jsonGrayTipElement.jsonStr);
            if (json.items.length === 1 && json.items[0]?.txt.endsWith('加入群')) {
                let old_members = structuredClone(this.core.apis.GroupApi.groupMemberCache.get(msg.peerUid));
                if (!old_members) return;
                let new_members_map = await this.core.apis.GroupApi.refreshGroupMemberCache(msg.peerUid, true);
                if (!new_members_map) return;
                let new_members = Array.from(new_members_map.values());
                // 对比members查找新成员
                let new_member = new_members.find((member) => old_members.get(member.uid) == undefined);
                if (!new_member) return;
                return new OB11GroupIncreaseEvent(
                    this.core,
                    +msg.peerUid,
                    +new_member.uin,
                    0,
                    'invite',
                );
            }
        }
        return;
    }
    async parseGrayTipElement(msg: RawMessage, grayTipElement: GrayTipElement) {
        if (grayTipElement.subElementType === NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_GROUP) {
            // 解析群组事件 由sysmsg解析
            return await this.parseGroupElement(msg, grayTipElement.groupElement, grayTipElement);
        } else if (grayTipElement.subElementType === NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
            // 筛选自身入群情况
            // if (grayTipElement.xmlElement.busiId === '10145') {
            //     const inviteData = new fastXmlParser.XMLParser({
            //         ignoreAttributes: false,
            //         attributeNamePrefix: '',
            //     }).parse(grayTipElement.xmlElement.content);

            //     const inviterUin: string = inviteData.gtip.qq[0].jp;
            //     const inviteeUin: string = inviteData.gtip.qq[1].jp;
            //     //刷新群缓存
            //     if (inviteeUin === this.core.selfInfo.uin) {
            //         this.core.apis.GroupApi.refreshGroupMemberCache(msg.peerUid).then().catch();
            //         return this.parseSelfInviteEvent(msg, inviterUin, inviteeUin);
            //     }
            // } else 
            if (grayTipElement.xmlElement?.templId === '10382') {
                return await this.obContext.apis.GroupApi.parseGroupEmojiLikeEventByGrayTip(msg.peerUid, grayTipElement);
            } else {
                //return await this.obContext.apis.GroupApi.parseGroupIncreaseEvent(msg.peerUid, grayTipElement);
            }
        } else if (grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
            // 解析json事件
            if (grayTipElement.jsonGrayTipElement.busiId == 1061) {
                return await this.parsePaiYiPai(msg, grayTipElement.jsonGrayTipElement.jsonStr);
            } else if (grayTipElement.jsonGrayTipElement.busiId == JsonGrayBusiId.AIO_GROUP_ESSENCE_MSG_TIP) {
                return await this.parseEssenceMsg(msg, grayTipElement.jsonGrayTipElement.jsonStr);
            } else if (+(grayTipElement.jsonGrayTipElement.busiId ?? 0) == 51) {
                // 51是什么？{"align":"center","items":[{"txt":"下一秒起床通过王者荣耀加入群","type":"nor"}]
                return await this.parse51TypeEvent(msg, grayTipElement);
            } else {
                return await this.parseOtherJsonEvent(msg, grayTipElement.jsonGrayTipElement.jsonStr, this.core.context);
            }
        }
        return undefined;
    }
}
