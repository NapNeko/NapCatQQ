import { ChatType, GrayTipElement, NapCatCore } from '@/core';
import { NapCatOneBot11Adapter } from '@/onebot';
import { OB11GroupBanEvent } from '../event/notice/OB11GroupBanEvent';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';
import { OB11GroupDecreaseEvent } from '../event/notice/OB11GroupDecreaseEvent';
import fastXmlParser from 'fast-xml-parser';
import { OB11GroupMsgEmojiLikeEvent } from '../event/notice/OB11MsgEmojiLikeEvent';
import { MessageUnique } from '@/common/message-unique';

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
        const NTQQGroupApi = this.core.apis.GroupApi;
        if (!groupElement?.shutUp) return undefined;
        const memberUid = groupElement.shutUp!.member.uid;
        const adminUid = groupElement.shutUp!.admin.uid;
        let memberUin: string;
        let duration = parseInt(groupElement.shutUp!.duration);
        const subType: 'ban' | 'lift_ban' = duration > 0 ? 'ban' : 'lift_ban';
        if (memberUid) {
            memberUin = (await NTQQGroupApi.getGroupMember(GroupCode, memberUid))?.uin || '';
        } else {
            memberUin = '0';  // 0表示全员禁言
            if (duration > 0) {
                duration = -1;
            }
        }
        const adminUin = (await NTQQGroupApi.getGroupMember(GroupCode, adminUid))?.uin;
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
        const NTQQGroupApi = this.core.apis.GroupApi;
        const groupElement = grayTipElement?.groupElement;
        if (!groupElement) return undefined;
        const member = await NTQQGroupApi.getGroupMember(GroupCode, groupElement.memberUid);
        const memberUin = member?.uin;
        const adminMember = await NTQQGroupApi.getGroupMember(GroupCode, groupElement.adminUid);
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
        const NTQQGroupApi = this.core.apis.GroupApi;
        const NTQQUserApi = this.core.apis.UserApi;
        const groupElement = grayTipElement?.groupElement;
        if (!groupElement) return undefined;
        const adminUin = (await NTQQGroupApi.getGroupMember(GroupCode, groupElement.adminUid))?.uin || (await NTQQUserApi.getUidByUinV2(groupElement.adminUid));
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
        const replyMsgList = (await this.core.apis.MsgApi.getMsgExBySeq(peer, msgSeq)).msgList;
        if (replyMsgList.length < 1) {
            return;
        }
        const replyMsg = replyMsgList
            .filter(e => e.msgSeq == msgSeq)
            .sort((a, b) => parseInt(a.msgTime) - parseInt(b.msgTime))[0];
        //console.log("表情回应消息长度检测", msgSeq, replyMsg.elements);
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
}
