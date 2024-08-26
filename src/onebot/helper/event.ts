import { NapCatOneBot11Adapter } from "..";
import { OB11BaseNoticeEvent } from "../event/notice/OB11BaseNoticeEvent";
import { OB11FriendAddNoticeEvent } from "../event/notice/OB11FriendAddNoticeEvent";
import { OB11GroupNoticeEvent } from "../event/notice/OB11GroupNoticeEvent";
import { OB11GroupCardEvent } from "../event/notice/OB11GroupCardEvent";
import { OB11GroupDecreaseEvent } from "../event/notice/OB11GroupDecreaseEvent";
import { OB11GroupUploadNoticeEvent } from "../event/notice/OB11GroupUploadNoticeEvent";
import { OB11GroupPokeEvent } from "../event/notice/OB11PokeEvent";
import { OB11GroupEssenceEvent } from "../event/notice/OB11GroupEssenceEvent";
import { MessageUnique } from "@/common/utils/MessageUnique";
import { OB11GroupTitleEvent } from "../event/notice/OB11GroupTitleEvent";
import { NapCatCore, RawMessage, ChatType, NTGrayTipElementSubTypeV2, TipGroupElementType, Peer } from '@/core';

export async function NT2PrivateEvent(core: NapCatCore, obContext: NapCatOneBot11Adapter, msg: RawMessage): Promise<OB11BaseNoticeEvent | undefined> {
    if (msg.chatType !== ChatType.KCHATTYPEC2C) {
        return;
    }
    for (const element of msg.elements) {
        if (element.grayTipElement) {
            if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
                if (element.grayTipElement.jsonGrayTipElement.busiId == 1061) {
                    const PokeEvent = await obContext.apis.FriendApi.parsePrivatePokeEvent(element.grayTipElement);
                    if (PokeEvent) return PokeEvent;
                }
            }
            if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
                //好友添加成功事件
                if (element.grayTipElement.xmlElement.templId === '10229' && msg.peerUin !== '') {
                    return new OB11FriendAddNoticeEvent(core, parseInt(msg.peerUin));
                }
            }
        }
    }
}

export async function NT2GroupEvent(core: NapCatCore, obContext: NapCatOneBot11Adapter, msg: RawMessage): Promise<OB11GroupNoticeEvent | undefined> {
    const NTQQGroupApi = core.apis.GroupApi;
    const NTQQUserApi = core.apis.UserApi;
    const NTQQMsgApi = core.apis.MsgApi;
    const logger = core.context.logger;
    if (msg.chatType !== ChatType.KCHATTYPEGROUP) {
        return;
    }
    //log("group msg", msg);
    if (msg.senderUin && msg.senderUin !== '0') {
        const member = await NTQQGroupApi.getGroupMember(msg.peerUid, msg.senderUin);
        if (member && member.cardName !== msg.sendMemberName) {
            const newCardName = msg.sendMemberName || '';
            const event = new OB11GroupCardEvent(core, parseInt(msg.peerUid), parseInt(msg.senderUin), newCardName, member.cardName);
            member.cardName = newCardName;
            return event;
        }
    }

    for (const element of msg.elements) {
        if (element.grayTipElement && element.grayTipElement.groupElement) {
            const groupElement = element.grayTipElement.groupElement;
            if (groupElement.type == TipGroupElementType.memberIncrease) {
                const MemberIncreaseEvent = await obContext.apis.GroupApi.parseGroupMemberIncreaseEvent(msg.peerUid, element.grayTipElement);
                if (MemberIncreaseEvent) return MemberIncreaseEvent;
            } else if (groupElement.type === TipGroupElementType.ban) {
                const BanEvent = await obContext.apis.GroupApi.parseGroupBanEvent(msg.peerUid, element.grayTipElement);
                if (BanEvent) return BanEvent;
            } else if (groupElement.type == TipGroupElementType.kicked) {
                NTQQGroupApi.quitGroup(msg.peerUid).then();
                try {
                    const KickEvent = await obContext.apis.GroupApi.parseGroupKickEvent(msg.peerUid, element.grayTipElement);
                    if (KickEvent) return KickEvent;
                } catch (e) {
                    return new OB11GroupDecreaseEvent(
                        core,
                        parseInt(msg.peerUid),
                        parseInt(core.selfInfo.uin),
                        0,
                        'leave'
                    );
                }
            }
        } else if (element.fileElement) {
            return new OB11GroupUploadNoticeEvent(
                core,
                parseInt(msg.peerUid), parseInt(msg.senderUin || ''),
                {
                    id: element.fileElement.fileUuid!,
                    name: element.fileElement.fileName,
                    size: parseInt(element.fileElement.fileSize),
                    busid: element.fileElement.fileBizId || 0,
                }
            );
        }
        if (element.grayTipElement) {
            if (element.grayTipElement.xmlElement?.templId === '10382') {
                const emojiLikeEvent = await obContext.apis.GroupApi.parseGroupEmjioLikeEvent(msg.peerUid, element.grayTipElement);
                if (emojiLikeEvent) return emojiLikeEvent;
            }
            if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
                const GroupIncreaseEvent = await obContext.apis.GroupApi.parseGroupIncreaseEvent(msg.peerUid, element.grayTipElement);
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
                            core,
                            parseInt(msg.peerUid),
                            parseInt((await NTQQUserApi.getUinByUidV2(poke_uid[0].uid))!),
                            parseInt((await NTQQUserApi.getUinByUidV2(poke_uid[1].uid))!),
                            pokedetail
                        );
                    }
                }
                if (element.grayTipElement.jsonGrayTipElement.busiId == 2401) {
                    const searchParams = new URL(json.items[0].jp).searchParams;
                    const msgSeq = searchParams.get('msgSeq')!;
                    const Group = searchParams.get('groupCode');
                    // const businessId = searchParams.get('businessid');
                    const Peer: Peer = {
                        guildId: '',
                        chatType: ChatType.KCHATTYPEGROUP,
                        peerUid: Group!,
                    };
                    const msgData = await NTQQMsgApi.getMsgsBySeqAndCount(Peer, msgSeq.toString(), 1, true, true);
                    return new OB11GroupEssenceEvent(
                        core,
                        parseInt(msg.peerUid),
                        MessageUnique.getShortIdByMsgId(msgData.msgList[0].msgId)!,
                        parseInt(msgData.msgList[0].senderUin)
                    );
                    // 获取MsgSeq+Peer可获取具体消息
                }
                if (element.grayTipElement.jsonGrayTipElement.busiId == 2407) {
                    //下面得改 上面也是错的grayTipElement.subElementType == GrayTipElementSubType.MEMBER_NEW_TITLE
                    const memberUin = json.items[1].param[0];
                    const title = json.items[3].txt;
                    logger.logDebug('收到群成员新头衔消息', json);
                    return new OB11GroupTitleEvent(
                        core,
                        parseInt(msg.peerUid),
                        parseInt(memberUin),
                        title
                    );
                }
            }
        }
    }
}
