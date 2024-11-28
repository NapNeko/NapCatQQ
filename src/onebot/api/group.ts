import {
    ChatType,
    FileElement,
    GrayTipElement,
    InstanceContext,
    JsonGrayBusiId,
    MessageElement,
    NapCatCore,
    NTGrayTipElementSubTypeV2,
    NTMsgType,
    RawMessage,
    TipGroupElement,
    TipGroupElementType,
} from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11GroupBanEvent } from '@/onebot/event/notice/OB11GroupBanEvent';
import { OB11GroupIncreaseEvent } from '@/onebot/event/notice/OB11GroupIncreaseEvent';
import { OB11GroupDecreaseEvent } from '@/onebot/event/notice/OB11GroupDecreaseEvent';
import fastXmlParser from 'fast-xml-parser';
import { OB11GroupMsgEmojiLikeEvent } from '@/onebot/event/notice/OB11MsgEmojiLikeEvent';
import { MessageUnique } from '@/common/message-unique';
import { OB11GroupCardEvent } from '@/onebot/event/notice/OB11GroupCardEvent';
import { OB11GroupPokeEvent } from '@/onebot/event/notice/OB11PokeEvent';
import { OB11GroupEssenceEvent } from '@/onebot/event/notice/OB11GroupEssenceEvent';
import { OB11GroupTitleEvent } from '@/onebot/event/notice/OB11GroupTitleEvent';
import { OB11GroupUploadNoticeEvent } from '../event/notice/OB11GroupUploadNoticeEvent';
import { pathToFileURL } from 'node:url';
import { FileNapCatOneBotUUID } from '@/common/helper';

export class OneBotGroupApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;
    GroupMemberList: Map<string, any> = new Map();//此处作为缓存 group_id->memberUin->info
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

    // async parseGroupIncreaseEvent(GroupCode: string, grayTipElement: GrayTipElement) {
    //     this.core.context.logger.logDebug('收到新人被邀请进群消息', grayTipElement);
    //     const xmlElement = grayTipElement.xmlElement;
    //     if (xmlElement?.content) {
    //         const regex = /jp="(\d+)"/g;

    //         const matches = [];
    //         let match = null;

    //         while ((match = regex.exec(xmlElement.content)) !== null) {
    //             matches.push(match[1]);
    //         }
    //         if (matches.length === 2) {
    //             const [inviter, invitee] = matches;
    //             return new OB11GroupIncreaseEvent(
    //                 this.core,
    //                 parseInt(GroupCode),
    //                 parseInt(invitee),
    //                 parseInt(inviter),
    //                 'invite',
    //             );
    //         }
    //     }
    //     return undefined;
    // }

    // async parseGroupMemberIncreaseEvent(GroupCode: string, grayTipElement: GrayTipElement) {
    //     const groupElement = grayTipElement?.groupElement;
    //     if (!groupElement) return undefined;
    //     const member = await this.core.apis.UserApi.getUserDetailInfo(groupElement.memberUid);
    //     const memberUin = member?.uin;
    //     const adminMember = await this.core.apis.GroupApi.getGroupMember(GroupCode, groupElement.adminUid);
    //     if (memberUin) {
    //         const operatorUin = adminMember?.uin ?? memberUin;
    //         return new OB11GroupIncreaseEvent(
    //             this.core,
    //             parseInt(GroupCode),
    //             parseInt(memberUin),
    //             parseInt(operatorUin),
    //         );
    //     } else {
    //         return undefined;
    //     }
    // }

    // async parseGroupKickEvent(GroupCode: string, grayTipElement: GrayTipElement) {
    //     const groupElement = grayTipElement?.groupElement;
    //     if (!groupElement) return undefined;
    //     const adminUin = (await this.core.apis.GroupApi.getGroupMember(GroupCode, groupElement.adminUid))?.uin ?? (await this.core.apis.UserApi.getUidByUinV2(groupElement.adminUid));
    //     if (adminUin) {
    //         return new OB11GroupDecreaseEvent(
    //             this.core,
    //             parseInt(GroupCode),
    //             parseInt(this.core.selfInfo.uin),
    //             parseInt(adminUin),
    //             'kick_me',
    //         );
    //     }
    //     return undefined;
    // }

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
        }
        return undefined;
    }

    // async parseGroupElement(msg: RawMessage, groupElement: TipGroupElement, elementWrapper: GrayTipElement) {
    //     if (groupElement.type == TipGroupElementType.KMEMBERADD) {
    //         const MemberIncreaseEvent = await this.obContext.apis.GroupApi.parseGroupMemberIncreaseEvent(msg.peerUid, elementWrapper);
    //         if (MemberIncreaseEvent) return MemberIncreaseEvent;
    //     } else if (groupElement.type === TipGroupElementType.KSHUTUP) {
    //         const BanEvent = await this.obContext.apis.GroupApi.parseGroupBanEvent(msg.peerUid, elementWrapper);
    //         if (BanEvent) return BanEvent;
    //     } else if (groupElement.type == TipGroupElementType.KQUITTE) {
    //         this.core.apis.GroupApi.quitGroup(msg.peerUid).then();
    //         try {
    //             const KickEvent = await this.obContext.apis.GroupApi.parseGroupKickEvent(msg.peerUid, elementWrapper);
    //             if (KickEvent) return KickEvent;
    //         } catch (e) {
    //             return new OB11GroupDecreaseEvent(
    //                 this.core,
    //                 parseInt(msg.peerUid),
    //                 parseInt(this.core.selfInfo.uin),
    //                 0,
    //                 'leave',
    //             );
    //         }
    //     }
    //     return undefined;
    // }

    async parsePaiYiPai(msg: RawMessage, jsonStr: string) {
        const json = JSON.parse(jsonStr);

        //判断业务类型
        //Poke事件
        const pokedetail: any[] = json.items;
        //筛选item带有uid的元素
        const poke_uid = pokedetail.filter(item => item.uid);
        if (poke_uid.length == 2) {
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
        if (type === "头衔") {
            const memberUin = json.items[1].param[0];
            const title = json.items[3].txt;
            context.logger.logDebug('收到群成员新头衔消息', json);
            return new OB11GroupTitleEvent(
                this.core,
                parseInt(msg.peerUid),
                parseInt(memberUin),
                title,
            );
        } else if (type === "移出") {
            context.logger.logDebug('收到机器人被踢消息', json);
            return;
        } else {
            context.logger.logWarn('收到未知的灰条消息', json);
        }
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
        return new OB11GroupEssenceEvent(
            this.core,
            parseInt(msg.peerUid),
            MessageUnique.getShortIdByMsgId(msgData.msgList[0].msgId)!,
            parseInt(msgData.msgList[0].senderUin),
            parseInt(realMsg?.add_digest_uin ?? '0'),
        );
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
                }, msg.msgId, elementWrapper.elementId, elementWrapper?.fileElement?.fileUuid, "." + element.fileName),
                url: pathToFileURL(element.filePath).href,
                name: element.fileName,
                size: parseInt(element.fileSize),
                busid: element.fileBizId ?? 0,
            },
        );
    }

    async parseGrayTipElement(msg: RawMessage, grayTipElement: GrayTipElement) {
        if (grayTipElement.subElementType === NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_GROUP) {
            // 解析群组事件 由sysmsg解析
            // return await this.parseGroupElement(msg, grayTipElement.groupElement, grayTipElement);

        } else if (grayTipElement.subElementType === NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
            // 筛选出表情回应 事件
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
            } else {
                return await this.parseOtherJsonEvent(msg, grayTipElement.jsonGrayTipElement.jsonStr, this.core.context);
            }
        }
        return undefined;
    }
}
