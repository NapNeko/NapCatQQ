import {
    ChatType,
    GrayTipElement,
    NapCatCore,
    NTGrayTipElementSubTypeV2,
    RawMessage,
    TipGroupElementType,
} from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11GroupBanEvent } from '../event/notice/OB11GroupBanEvent';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';
import { OB11GroupDecreaseEvent } from '../event/notice/OB11GroupDecreaseEvent';
import fastXmlParser from 'fast-xml-parser';
import { OB11GroupMsgEmojiLikeEvent } from '../event/notice/OB11MsgEmojiLikeEvent';
import { MessageUnique } from '@/common/message-unique';
import { OB11GroupCardEvent } from '@/onebot/event/notice/OB11GroupCardEvent';
import { OB11GroupUploadNoticeEvent } from '@/onebot/event/notice/OB11GroupUploadNoticeEvent';
import { OB11GroupPokeEvent } from '@/onebot/event/notice/OB11PokeEvent';
import { OB11GroupEssenceEvent } from '@/onebot/event/notice/OB11GroupEssenceEvent';
import { OB11GroupTitleEvent } from '@/onebot/event/notice/OB11GroupTitleEvent';
import { FileNapCatOneBotUUID } from '@/common/helper';
import { pathToFileURL } from 'node:url';

export class OneBotGroupApi {
    obContext: NapCatOneBot11Adapter;
    core: NapCatCore;
    GroupMemberList: Map<string, any> = new Map();//此处作为缓存 group_id->memberUin->info
    constructor(obContext: NapCatOneBot11Adapter, core: NapCatCore) {
        this.obContext = obContext;
        this.core = core;
    }

    async parseGroupEvent(msg: RawMessage) {
        const logger = this.core.context.logger;
        if (msg.chatType !== ChatType.KCHATTYPEGROUP) {
            return;
        }
        //log("group msg", msg);
        if (msg.senderUin && msg.senderUin !== '0') {
            const member = await this.core.apis.GroupApi.getGroupMember(msg.peerUid, msg.senderUin);
            if (member && member.cardName !== msg.sendMemberName) {
                const newCardName = msg.sendMemberName || '';
                const event = new OB11GroupCardEvent(this.core, parseInt(msg.peerUid), parseInt(msg.senderUin), newCardName, member.cardName);
                member.cardName = newCardName;
                return event;
            }
        }

        for (const element of msg.elements) {
            if (element.grayTipElement && element.grayTipElement.groupElement) {
                const groupElement = element.grayTipElement.groupElement;
                if (groupElement.type == TipGroupElementType.memberIncrease) {
                    const MemberIncreaseEvent = await this.obContext.apis.GroupApi.parseGroupMemberIncreaseEvent(msg.peerUid, element.grayTipElement);
                    if (MemberIncreaseEvent) return MemberIncreaseEvent;
                } else if (groupElement.type === TipGroupElementType.ban) {
                    const BanEvent = await this.obContext.apis.GroupApi.parseGroupBanEvent(msg.peerUid, element.grayTipElement);
                    if (BanEvent) return BanEvent;
                } else if (groupElement.type == TipGroupElementType.kicked) {
                    this.core.apis.GroupApi.quitGroup(msg.peerUid).then();
                    try {
                        const KickEvent = await this.obContext.apis.GroupApi.parseGroupKickEvent(msg.peerUid, element.grayTipElement);
                        if (KickEvent) return KickEvent;
                    } catch (e) {
                        return new OB11GroupDecreaseEvent(
                            this.core,
                            parseInt(msg.peerUid),
                            parseInt(this.core.selfInfo.uin),
                            0,
                            'leave',
                        );
                    }
                }
            } else if (element.fileElement) {
                return new OB11GroupUploadNoticeEvent(
                    this.core,
                    parseInt(msg.peerUid), parseInt(msg.senderUin || ''),
                    {
                        id: FileNapCatOneBotUUID.encode({
                            chatType: ChatType.KCHATTYPEGROUP,
                            peerUid: msg.peerUid,
                        }, msg.msgId, element.elementId, "." + element.fileElement.fileName),
                        url: pathToFileURL(element.fileElement.filePath).href,
                        name: element.fileElement.fileName,
                        size: parseInt(element.fileElement.fileSize),
                        busid: element.fileElement.fileBizId || 0,
                    },
                );
            }
            if (element.grayTipElement) {
                if (element.grayTipElement.xmlElement?.templId === '10382') {
                    const emojiLikeEvent = await this.obContext.apis.GroupApi.parseGroupEmojiLikeEventByGrayTip(msg.peerUid, element.grayTipElement);
                    if (emojiLikeEvent) return emojiLikeEvent;
                }
                if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
                    const GroupIncreaseEvent = await this.obContext.apis.GroupApi.parseGroupIncreaseEvent(msg.peerUid, element.grayTipElement);
                    if (GroupIncreaseEvent) return GroupIncreaseEvent;
                }

                //代码歧义 GrayTipElementSubType.MEMBER_NEW_TITLE
                else if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
                    const json = JSON.parse(element.grayTipElement.jsonGrayTipElement.jsonStr);
                    if (element.grayTipElement.jsonGrayTipElement.busiId == 1061) {
                        //判断业务类型
                        //Poke事件
                        const pokedetail: any[] = json.items;
                        //筛选item带有uid的元素
                        const poke_uid = pokedetail.filter(item => item.uid);
                        if (poke_uid.length == 2) {
                            return new OB11GroupPokeEvent(
                                this.core,
                                parseInt(msg.peerUid),
                                parseInt((await this.core.apis.UserApi.getUinByUidV2(poke_uid[0].uid))!),
                                parseInt((await this.core.apis.UserApi.getUinByUidV2(poke_uid[1].uid))!),
                                pokedetail,
                            );
                        }
                    }
                    if (element.grayTipElement.jsonGrayTipElement.busiId == 2401) {
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
                    if (element.grayTipElement.jsonGrayTipElement.busiId == 2407) {
                        //下面得改 上面也是错的grayTipElement.subElementType == GrayTipElementSubType.MEMBER_NEW_TITLE
                        const type = json.items[json.items.length - 1]?.txt;
                        switch (type) {
                        case "头衔": {
                            const memberUin = json.items[1].param[0];
                            const title = json.items[3].txt;
                            logger.logDebug('收到群成员新头衔消息', json);
                            return new OB11GroupTitleEvent(
                                this.core,
                                parseInt(msg.peerUid),
                                parseInt(memberUin),
                                title,
                            );
                        }
                        case "移出":
                            logger.logDebug('收到机器人被踢消息', json);
                            return;
                        default:
                            logger.logWarn('收到未知的灰条消息', json);
                        }
                    }
                }
            }
        }
    }

    async parseGroupBanEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        const groupElement = grayTipElement?.groupElement;
        if (!groupElement?.shutUp) return undefined;
        const memberUid = groupElement.shutUp!.member.uid;
        const adminUid = groupElement.shutUp!.admin.uid;
        let memberUin: string;
        let duration = parseInt(groupElement.shutUp!.duration);
        const subType: 'ban' | 'lift_ban' = duration > 0 ? 'ban' : 'lift_ban';
        if (memberUid) {
            memberUin = (await this.core.apis.GroupApi.getGroupMember(GroupCode, memberUid))?.uin || '';
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

    async parseGroupIncreaseEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        this.core.context.logger.logDebug('收到新人被邀请进群消息', grayTipElement);
        const xmlElement = grayTipElement.xmlElement;
        if (xmlElement?.content) {
            const regex = /jp="(\d+)"/g;

            const matches = [];
            let match = null;

            while ((match = regex.exec(xmlElement.content)) !== null) {
                matches.push(match[1]);
            }
            // log("新人进群匹配到的QQ号", matches)
            if (matches.length === 2) {
                const [inviter, invitee] = matches;
                return new OB11GroupIncreaseEvent(
                    this.core,
                    parseInt(GroupCode),
                    parseInt(invitee),
                    parseInt(inviter),
                    'invite',
                );
            }
        }
        return undefined;
    }

    async parseGroupMemberIncreaseEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        const groupElement = grayTipElement?.groupElement;
        if (!groupElement) return undefined;
        const member = await this.core.apis.UserApi.getUserDetailInfo(groupElement.memberUid);
        const memberUin = member?.uin;
        const adminMember = await this.core.apis.GroupApi.getGroupMember(GroupCode, groupElement.adminUid);
        if (memberUin) {
            const operatorUin = adminMember?.uin || memberUin;
            return new OB11GroupIncreaseEvent(
                this.core,
                parseInt(GroupCode),
                parseInt(memberUin),
                parseInt(operatorUin),
            );
        } else {
            return undefined;
        }
    }

    async parseGroupKickEvent(GroupCode: string, grayTipElement: GrayTipElement) {
        const groupElement = grayTipElement?.groupElement;
        if (!groupElement) return undefined;
        const adminUin = (await this.core.apis.GroupApi.getGroupMember(GroupCode, groupElement.adminUid))?.uin || (await this.core.apis.UserApi.getUidByUinV2(groupElement.adminUid));
        if (adminUin) {
            return new OB11GroupDecreaseEvent(
                this.core,
                parseInt(GroupCode),
                parseInt(this.core.selfInfo.uin),
                parseInt(adminUin),
                'kick_me',
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
            this.core.context.logger.logError.bind(this.core.context.logger)('解析表情回应消息失败: 未找到回应消息');
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
}
