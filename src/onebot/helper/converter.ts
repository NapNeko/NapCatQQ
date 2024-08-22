import { UUIDConverter, calcQQLevel } from '@/common/utils/helper';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { NapCatCore, RawMessage, ChatType, AtType, VideoElement, FaceIndex, NTGrayTipElementSubTypeV2, TipGroupElementType, Peer, SelfInfo, FriendV2, Friend, Sex, GroupMember, User, Group } from '@/core';
import { NapCatOneBot11Adapter } from '..';
import { OB11BaseNoticeEvent } from '../event/notice/OB11BaseNoticeEvent';
import { OB11FriendAddNoticeEvent } from '../event/notice/OB11FriendAddNoticeEvent';
import { OB11GroupCardEvent } from '../event/notice/OB11GroupCardEvent';
import { OB11GroupDecreaseEvent } from '../event/notice/OB11GroupDecreaseEvent';
import { OB11GroupEssenceEvent } from '../event/notice/OB11GroupEssenceEvent';
import { OB11GroupNoticeEvent } from '../event/notice/OB11GroupNoticeEvent';
import { OB11GroupTitleEvent } from '../event/notice/OB11GroupTitleEvent';
import { OB11GroupUploadNoticeEvent } from '../event/notice/OB11GroupUploadNoticeEvent';
import { OB11GroupPokeEvent } from '../event/notice/OB11PokeEvent';
import { EventType } from '../event/OB11BaseEvent';
import { OB11Message, OB11MessageData, OB11MessageDataType, OB11User, OB11GroupMemberRole, OB11UserSex, OB11GroupMember, OB11Group } from '../types';
import { encodeCQCode } from './cqcode';


export class OB11Constructor {
    static async PrivateEvent(core: NapCatCore, obContext: NapCatOneBot11Adapter, msg: RawMessage): Promise<OB11BaseNoticeEvent | undefined> {
        if (msg.chatType !== ChatType.friend) {
            return;
        }
        for (const element of msg.elements) {
            if (element.grayTipElement) {
                if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_JSON) {
                    if (element.grayTipElement.jsonGrayTipElement.busiId == 1061) {
                        let PokeEvent = await obContext.apiContext.FriendApi.parsePrivatePokeEvent(element.grayTipElement);
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

    static async GroupEvent(core: NapCatCore, obContext: NapCatOneBot11Adapter, msg: RawMessage): Promise<OB11GroupNoticeEvent | undefined> {
        const NTQQGroupApi = core.apis.GroupApi;
        const NTQQUserApi = core.apis.UserApi;
        const NTQQMsgApi = core.apis.MsgApi;
        const logger = core.context.logger;
        if (msg.chatType !== ChatType.group) {
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
                    let MemberIncreaseEvent = await obContext.apiContext.GroupApi.parseGroupMemberIncreaseEvent(msg.peerUid, element.grayTipElement);
                    if (MemberIncreaseEvent) return MemberIncreaseEvent;
                } else if (groupElement.type === TipGroupElementType.ban) {
                    let BanEvent = await obContext.apiContext.GroupApi.parseGroupBanEvent(msg.peerUid, element.grayTipElement);
                    if (BanEvent) return BanEvent;
                } else if (groupElement.type == TipGroupElementType.kicked) {
                    NTQQGroupApi.quitGroup(msg.peerUid).then();
                    try {
                        let KickEvent = await obContext.apiContext.GroupApi.parseGroupKickEvent(msg.peerUid, element.grayTipElement);
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
                    let emojiLikeEvent = await obContext.apiContext.GroupApi.parseGroupEmjioLikeEvent(msg.peerUid, element.grayTipElement);
                    if (emojiLikeEvent) return emojiLikeEvent;
                }
                if (element.grayTipElement.subElementType == NTGrayTipElementSubTypeV2.GRAYTIP_ELEMENT_SUBTYPE_XMLMSG) {
                    let GroupIncreaseEvent = await obContext.apiContext.GroupApi.parseGroupMemberIncreaseEvent(msg.peerUid, element.grayTipElement);
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
                            chatType: ChatType.group,
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

    static selfInfo(selfInfo: SelfInfo): OB11User {
        return {
            user_id: parseInt(selfInfo.uin),
            nickname: selfInfo.nick,
        };
    }

    static friendsV2(friends: FriendV2[]): OB11User[] {
        const data: OB11User[] = [];
        friends.forEach(friend => {
            const sexValue = this.sex(friend.baseInfo.sex!);
            data.push({
                ...friend.baseInfo,
                ...friend.coreInfo,
                user_id: parseInt(friend.coreInfo.uin),
                nickname: friend.coreInfo.nick,
                remark: friend.coreInfo.nick,
                sex: sexValue,
                level: 0,
            });
        });
        return data;
    }

    static friends(friends: Friend[]): OB11User[] {
        const data: OB11User[] = [];
        friends.forEach(friend => {
            const sexValue = this.sex(friend.sex!);
            data.push({
                user_id: parseInt(friend.uin),
                nickname: friend.nick,
                remark: friend.remark,
                sex: sexValue,
                level: 0,
            });
        });
        return data;
    }

    static groupMemberRole(role: number): OB11GroupMemberRole | undefined {
        return {
            4: OB11GroupMemberRole.owner,
            3: OB11GroupMemberRole.admin,
            2: OB11GroupMemberRole.member,
        }[role];
    }

    static sex(sex: Sex): OB11UserSex {
        const sexMap = {
            [Sex.male]: OB11UserSex.male,
            [Sex.female]: OB11UserSex.female,
            [Sex.unknown]: OB11UserSex.unknown,
        };
        return sexMap[sex] || OB11UserSex.unknown;
    }

    static groupMember(group_id: string, member: GroupMember): OB11GroupMember {
        return {
            group_id: parseInt(group_id),
            user_id: parseInt(member.uin),
            nickname: member.nick,
            card: member.cardName,
            sex: OB11Constructor.sex(member.sex!),
            age: member.age ?? 0,
            area: '',
            level: '0',
            qq_level: member.qqLevel && calcQQLevel(member.qqLevel) || 0,
            join_time: 0, // 暂时没法获取
            last_sent_time: 0, // 暂时没法获取
            title_expire_time: 0,
            unfriendly: false,
            card_changeable: true,
            is_robot: member.isRobot,
            shut_up_timestamp: member.shutUpTime,
            role: OB11Constructor.groupMemberRole(member.role),
            title: member.memberSpecialTitle || '',
        };
    }

    static stranger(user: User): OB11User {
        //logDebug('construct ob11 stranger', user);
        return {
            ...user,
            user_id: parseInt(user.uin),
            nickname: user.nick,
            sex: OB11Constructor.sex(user.sex!),
            age: 0,
            qid: user.qid,
            login_days: 0,
            level: user.qqLevel && calcQQLevel(user.qqLevel) || 0,
        };
    }


    static group(group: Group): OB11Group {
        return {
            group_id: parseInt(group.groupCode),
            group_name: group.groupName,
            member_count: group.memberCount,
            max_member_count: group.maxMember,
        };
    }

    static groups(groups: Group[]): OB11Group[] {
        return groups.map(OB11Constructor.group);
    }
}
