import fastXmlParser from 'fast-xml-parser';
import {
    OB11Group,
    OB11GroupMember,
    OB11GroupMemberRole,
    OB11Message,
    OB11MessageData,
    OB11MessageDataType,
    OB11User,
    OB11UserSex,
} from '../types';
import {
    AtType,
    ChatType,
    FaceIndex,
    Friend,
    FriendV2,
    GrayTipElementSubType,
    Group,
    GroupMember,
    Peer,
    RawMessage,
    SelfInfo,
    Sex,
    TipGroupElementType,
    User,
    VideoElement,
} from '@/core/entities';
import { EventType } from '../event/OB11BaseEvent';
import { encodeCQCode } from './cqcode';
import { OB11GroupIncreaseEvent } from '../event/notice/OB11GroupIncreaseEvent';
import { OB11GroupBanEvent } from '../event/notice/OB11GroupBanEvent';
import { OB11GroupUploadNoticeEvent } from '../event/notice/OB11GroupUploadNoticeEvent';
import { OB11GroupNoticeEvent } from '../event/notice/OB11GroupNoticeEvent';
import { calcQQLevel, sleep, UUIDConverter } from '@/common/utils/helper';
import { OB11GroupTitleEvent } from '../event/notice/OB11GroupTitleEvent';
import { OB11GroupDecreaseEvent } from '../event/notice/OB11GroupDecreaseEvent';
import { OB11GroupMsgEmojiLikeEvent } from '@/onebot/event/notice/OB11MsgEmojiLikeEvent';
import { OB11FriendPokeEvent, OB11GroupPokeEvent } from '../event/notice/OB11PokeEvent';
import { OB11FriendAddNoticeEvent } from '../event/notice/OB11FriendAddNoticeEvent';
import { OB11BaseNoticeEvent } from '../event/notice/OB11BaseNoticeEvent';
import { OB11GroupEssenceEvent } from '../event/notice/OB11GroupEssenceEvent';
import { MessageUnique } from '@/common/utils/MessageUnique';
import { NapCatCore } from '@/core';

export class OB11Constructor {
    static async message(core: NapCatCore, msg: RawMessage, messagePostFormat: any): Promise<OB11Message | undefined> {
        if (msg.senderUin == "0") return;
        if (msg.peerUin == "0") return;
        //跳过空消息
        const NTQQGroupApi = core.apis.GroupApi;
        const NTQQUserApi = core.apis.UserApi;
        const NTQQFileApi = core.apis.FileApi;
        const NTQQMsgApi = core.apis.MsgApi;
        const logger = core.context.logger;
        const resMsg: OB11Message = {
            self_id: parseInt(core.selfInfo.uin),
            user_id: parseInt(msg.senderUin!),
            time: parseInt(msg.msgTime) || Date.now(),
            message_id: msg.id!,
            message_seq: msg.id!,
            real_id: msg.id!,
            message_type: msg.chatType == ChatType.group ? 'group' : 'private',
            sender: {
                user_id: parseInt(msg.senderUin || '0'),
                nickname: msg.sendNickName,
                card: msg.sendMemberName || '',
            },
            raw_message: '',
            font: 14,
            sub_type: 'friend',
            message: messagePostFormat === 'string' ? '' : [],
            message_format: messagePostFormat === 'string' ? 'string' : 'array',
            post_type: core.selfInfo.uin == msg.senderUin ? EventType.MESSAGE_SENT : EventType.MESSAGE,
        };
        if (msg.chatType == ChatType.group) {
            resMsg.sub_type = 'normal'; // 这里go-cqhttp是group，而onebot11标准是normal, 蛋疼
            resMsg.group_id = parseInt(msg.peerUin);
            //直接去QQNative取
            const memberList = await NTQQGroupApi.getGroupMembers(msg.peerUin);
            const member = memberList.get(msg.senderUin!);
            if (member) {
                resMsg.sender.role = OB11Constructor.groupMemberRole(member.role);
                resMsg.sender.nickname = member.nick;
            }
        } else if (msg.chatType == ChatType.friend) {
            resMsg.sub_type = 'friend';
            resMsg.sender.nickname = (await NTQQUserApi.getUserDetailInfo(msg.senderUid)).nick;
            //const user = await NTQQUserApi.getUserDetailInfoByUin(msg.senderUin!);
            //resMsg.sender.nickname = user.info.nick;
        } else if (msg.chatType == ChatType.temp) {
            resMsg.sub_type = 'group';
            const ret = await NTQQMsgApi.getTempChatInfo(ChatType.temp, msg.senderUid);
            if (ret.result === 0) {
                resMsg.group_id = parseInt(ret.tmpChatInfo!.groupCode);
                resMsg.sender.nickname = ret.tmpChatInfo!.fromNick;
            } else {
                resMsg.group_id = 284840486;//兜底数据
                resMsg.sender.nickname = "临时会话";
            }
        }
        for (const element of msg.elements) {
            let message_data: OB11MessageData = {
                data: {} as any,
                type: 'unknown' as any,
            };
            if (element.textElement && element.textElement?.atType !== AtType.notAt) {
                let qq: `${number}` | 'all';
                let name: string | undefined;
                if (element.textElement.atType == AtType.atAll) {
                    qq = 'all';
                } else {
                    const { atNtUid, content } = element.textElement;
                    let atQQ = element.textElement.atUid;
                    if (!atQQ || atQQ === '0') {
                        atQQ = await NTQQUserApi.getUinByUid(atNtUid);
                    }
                    if (atQQ) {
                        qq = atQQ as `${number}`;
                        name = content.replace('@', '');
                    }
                }
                message_data = {
                    type: OB11MessageDataType.at,
                    data: {
                        qq: qq!,
                        name,
                    },
                };
            } else if (element.textElement) {
                message_data['type'] = OB11MessageDataType.text;

                let text = element.textElement.content;
                if (!text.trim()) {
                    continue;
                }
                // 兼容 9.7.x 换行符
                if (text.indexOf('\n') === -1 && text.indexOf('\r\n') === -1) {
                    text = text.replace(/\r/g, '\n');
                }
                message_data['data']['text'] = text;
            } else if (element.replyElement) {
                message_data['type'] = OB11MessageDataType.reply;
                //log("收到回复消息", element.replyElement);
                try {
                    const records = msg.records.find(msgRecord => msgRecord.msgId === element?.replyElement?.sourceMsgIdInRecords);
                    const peer = {
                        chatType: msg.chatType,
                        peerUid: msg.peerUid,
                        guildId: '',
                    };
                    let replyMsg: RawMessage | undefined;
                    if (!records) throw new Error('找不到回复消息');
                    replyMsg = (await NTQQMsgApi.getMsgsBySeqAndCount({
                        peerUid: msg.peerUid,
                        guildId: '',
                        chatType: msg.chatType,
                    }, element.replyElement.replayMsgSeq, 1, true, true)).msgList[0];
                    if (!replyMsg || records.msgRandom !== replyMsg.msgRandom) {
                        replyMsg = (await NTQQMsgApi.getSingleMsg(peer, element.replyElement.replayMsgSeq)).msgList[0];
                    }
                    if (msg.peerUin == '284840486') {
                        //合并消息内侧 消息具体定位不到
                    }
                    if ((!replyMsg || records.msgRandom !== replyMsg.msgRandom) && msg.peerUin !== '284840486') {
                        throw new Error('回复消息消息验证失败');
                    }
                    message_data['data']['id'] = MessageUnique.createMsg({
                        peerUid: msg.peerUid,
                        guildId: '',
                        chatType: msg.chatType,
                    }, replyMsg.msgId)?.toString();
                    //log("找到回复消息", message_data['data']['id'], replyMsg.msgList[0].msgId)
                } catch (e: any) {
                    message_data['type'] = 'unknown' as any;
                    message_data['data'] = undefined;
                    logger.logError('获取不到引用的消息', e.stack, element.replyElement.replayMsgSeq);
                }

            } else if (element.picElement) {
                message_data['type'] = OB11MessageDataType.image;
                // message_data["data"]["file"] = element.picElement.sourcePath
                message_data['data']['file'] = element.picElement.fileName;
                message_data['data']['subType'] = element.picElement.picSubType;
                message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
                // message_data["data"]["path"] = element.picElement.sourcePath

                try {
                    message_data['data']['url'] = await NTQQFileApi.getImageUrl(element.picElement);
                } catch (e: any) {
                    logger.logError('获取图片url失败', e.stack);
                }
                //console.log(message_data['data']['url'])
                // message_data["data"]["file_id"] = element.picElement.fileUuid
                message_data['data']['file_size'] = element.picElement.fileSize;
            } else if (element.fileElement) {
                const FileElement = element.fileElement;
                message_data['type'] = OB11MessageDataType.file;
                message_data['data']['file'] = FileElement.fileName;
                message_data['data']['path'] = FileElement.filePath;
                message_data['data']['url'] = FileElement.filePath;
                message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
                message_data['data']['file_size'] = FileElement.fileSize;
                await NTQQFileApi.addFileCache(
                    {
                        peerUid: msg.peerUid,
                        chatType: msg.chatType,
                        guildId: '',
                    },
                    msg.msgId,
                    msg.msgSeq,
                    msg.senderUid,
                    element.elementId,
                    element.elementType.toString(),
                    FileElement.fileSize,
                    FileElement.fileName,
                );
            } else if (element.videoElement) {
                const videoElement: VideoElement = element.videoElement;
                //读取视频链接并兜底
                let videoUrl;//Array
                if (msg.peerUin === '284840486') {
                    //合并消息内部 应该进行特殊处理 可能需要重写peer 待测试与研究 Mlikiowa Taged TODO
                }
                try {

                    videoUrl = await NTQQFileApi.getVideoUrl({
                        chatType: msg.chatType,
                        peerUid: msg.peerUid,
                        guildId: '0',
                    }, msg.msgId, element.elementId);
                } catch (error) {
                    videoUrl = undefined;
                }
                //读取在线URL
                let videoDownUrl = undefined;

                if (videoUrl) {
                    const videoDownUrlTemp = videoUrl.find((url) => {
                        return !!url.url;
                    });
                    if (videoDownUrlTemp) {
                        videoDownUrl = videoDownUrlTemp.url;
                    }
                }
                //开始兜底
                if (!videoDownUrl) {
                    videoDownUrl = videoElement.filePath;
                }
                message_data['type'] = OB11MessageDataType.video;
                message_data['data']['file'] = videoElement.fileName;
                message_data['data']['path'] = videoDownUrl;
                message_data['data']['url'] = videoDownUrl;
                message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
                message_data['data']['file_size'] = videoElement.fileSize;

                await NTQQFileApi.addFileCache(
                    {
                        peerUid: msg.peerUid,
                        chatType: msg.chatType,
                        guildId: '',
                    },
                    msg.msgId,
                    msg.msgSeq,
                    msg.senderUid,
                    element.elementId,
                    element.elementType.toString(),
                    videoElement.fileSize || '0',
                    videoElement.fileName,
                );
            } else if (element.pttElement) {
                message_data['type'] = OB11MessageDataType.voice;
                message_data['data']['file'] = element.pttElement.fileName;
                message_data['data']['path'] = element.pttElement.filePath;
                //message_data['data']['file_id'] = element.pttElement.fileUuid;
                message_data['data']['file_id'] = UUIDConverter.encode(msg.peerUin, msg.msgId);
                message_data['data']['file_size'] = element.pttElement.fileSize;
                await NTQQFileApi.addFileCache({
                    peerUid: msg.peerUid,
                    chatType: msg.chatType,
                    guildId: '',
                },
                    msg.msgId,
                    msg.msgSeq,
                    msg.senderUid,
                    element.elementId,
                    element.elementType.toString(),
                    element.pttElement.fileSize || '0',
                    element.pttElement.fileUuid || '',
                );
                //以uuid作为文件名
            } else if (element.arkElement) {
                message_data['type'] = OB11MessageDataType.json;
                message_data['data']['data'] = element.arkElement.bytesData;
            } else if (element.faceElement) {
                const faceId = element.faceElement.faceIndex;
                if (faceId === FaceIndex.dice) {
                    message_data['type'] = OB11MessageDataType.dice;
                    message_data['data']['result'] = element.faceElement.resultId;
                } else if (faceId === FaceIndex.RPS) {
                    message_data['type'] = OB11MessageDataType.RPS;
                    message_data['data']['result'] = element.faceElement.resultId;
                } else {
                    message_data['type'] = OB11MessageDataType.face;
                    message_data['data']['id'] = element.faceElement.faceIndex.toString();
                }
            } else if (element.marketFaceElement) {
                message_data['type'] = OB11MessageDataType.mface;
                message_data['data']['summary'] = element.marketFaceElement.faceName;
                const md5 = element.marketFaceElement.emojiId;
                // 取md5的前两位
                const dir = md5.substring(0, 2);
                // 获取组装url
                // const url = `https://p.qpic.cn/CDN_STATIC/0/data/imgcache/htdocs/club/item/parcel/item/${dir}/${md5}/300x300.gif?max_age=31536000`;
                message_data['data']['url'] = `https://gxh.vip.qq.com/club/item/parcel/item/${dir}/${md5}/raw300.gif`;
                message_data['data']['emoji_id'] = element.marketFaceElement.emojiId;
                message_data['data']['emoji_package_id'] = String(element.marketFaceElement.emojiPackageId);
                message_data['data']['key'] = element.marketFaceElement.key;
                //mFaceCache.set(md5, element.marketFaceElement.faceName);
            } else if (element.markdownElement) {
                message_data['type'] = OB11MessageDataType.markdown;
                message_data['data']['data'] = element.markdownElement.content;
            } else if (element.multiForwardMsgElement) {
                message_data['type'] = OB11MessageDataType.forward;
                message_data['data']['id'] = msg.msgId;
                const ParentMsgPeer = msg.parentMsgPeer ?? {
                    chatType: msg.chatType,
                    guildId: '',
                    peerUid: msg.peerUid,
                };
                //判断是否在合并消息内
                msg.parentMsgIdList = msg.parentMsgIdList ?? [];
                //首次列表不存在则开始创建
                msg.parentMsgIdList.push(msg.msgId);
                //let parentMsgId = msg.parentMsgIdList[msg.parentMsgIdList.length - 2 < 0 ? 0 : msg.parentMsgIdList.length - 2];
                //加入自身MsgId
                const MultiMsgs = (await NTQQMsgApi.getMultiMsg(ParentMsgPeer, msg.parentMsgIdList[0], msg.msgId))?.msgList;
                //拉取下级消息
                if (!MultiMsgs) continue;
                //拉取失败则跳过
                message_data['data']['content'] = [];
                for (const MultiMsg of MultiMsgs) {
                    //对每条拉取的消息传递ParentMsgPeer修正Peer
                    MultiMsg.parentMsgPeer = ParentMsgPeer;
                    MultiMsg.parentMsgIdList = msg.parentMsgIdList;
                    MultiMsg.id = MessageUnique.createMsg(ParentMsgPeer, MultiMsg.msgId);//该ID仅用查看 无法调用
                    const msgList = await OB11Constructor.message(core, MultiMsg, 'array');
                    if (!msgList) continue;
                    message_data['data']['content'].push(msgList);
                    //console.log("合并消息", msgList);
                }
            }
            if ((message_data.type as string) !== 'unknown' && message_data.data) {
                const cqCode = encodeCQCode(message_data);

                if (messagePostFormat === 'string') {
                    (resMsg.message as string) += cqCode;
                } else (resMsg.message as OB11MessageData[]).push(message_data);
                resMsg.raw_message += cqCode;
            }

        }
        resMsg.raw_message = resMsg.raw_message.trim();
        return resMsg;
    }

    static async PrivateEvent(core: NapCatCore, msg: RawMessage): Promise<OB11BaseNoticeEvent | undefined> {
        const NTQQUserApi = core.apis.UserApi;
        if (msg.chatType !== ChatType.friend) {
            return;
        }
        for (const element of msg.elements) {
            if (element.grayTipElement) {
                if (element.grayTipElement.subElementType == GrayTipElementSubType.MEMBER_NEW_TITLE) {
                    const json = JSON.parse(element.grayTipElement.jsonGrayTipElement.jsonStr);

                    if (element.grayTipElement.jsonGrayTipElement.busiId == 1061) {
                        //判断业务类型
                        //Poke事件
                        let pokedetail: any[] = json.items;
                        //筛选item带有uid的元素
                        pokedetail = pokedetail.filter(item => item.uid);
                        //console.log("[NapCat] 群拍一拍 群:", pokedetail, parseInt(msg.peerUid), " ", await NTQQUserApi.getUinByUid(pokedetail[0].uid), "拍了拍", await NTQQUserApi.getUinByUid(pokedetail[1].uid));
                        if (pokedetail.length == 2) {
                            return new OB11FriendPokeEvent(
                                core,
                                parseInt((await NTQQUserApi.getUinByUidV2(pokedetail[0].uid))!),
                                parseInt((await NTQQUserApi.getUinByUidV2(pokedetail[1].uid))!),
                                pokedetail
                            );
                        }
                    }
                    //下面得改 上面也是错的grayTipElement.subElementType == GrayTipElementSubType.MEMBER_NEW_TITLE
                }
                if (element.grayTipElement.subElementType == GrayTipElementSubType.INVITE_NEW_MEMBER) {
                    //好友添加成功事件
                    if (element.grayTipElement.xmlElement.templId === '10229' && msg.peerUin !== '') {
                        return new OB11FriendAddNoticeEvent(core, parseInt(msg.peerUin));
                    }
                }
            }
        }
    }

    static async GroupEvent(core: NapCatCore, msg: RawMessage): Promise<OB11GroupNoticeEvent | undefined> {
        const NTQQGroupApi = core.apis.GroupApi;
        const NTQQUserApi = core.apis.UserApi;
        const NTQQMsgApi = core.apis.MsgApi;
        const logger = core.context.logger;
        if (msg.chatType !== ChatType.group) {
            return;
        }
        //log("group msg", msg);
        // Mlikiowa V2.0.8 Refactor Todo
        // if (msg.senderUin && msg.senderUin !== '0') {
        //   const member = await getGroupMember(msg.peerUid, msg.senderUin);
        //   if (member && member.cardName !== msg.sendMemberName) {
        //     const newCardName = msg.sendMemberName || '';
        //     const event = new OB11GroupCardEvent(parseInt(msg.peerUid), parseInt(msg.senderUin), newCardName, member.cardName);
        //     member.cardName = newCardName;
        //     return event;
        //   }
        // }

        for (const element of msg.elements) {
            const grayTipElement = element.grayTipElement;
            const groupElement = grayTipElement?.groupElement;
            if (groupElement) {
                // log("收到群提示消息", groupElement)
                if (groupElement.type == TipGroupElementType.memberIncrease) {
                    logger.logDebug('收到群成员增加消息', groupElement);
                    await sleep(1000);
                    const member = await NTQQGroupApi.getGroupMember(msg.peerUid, groupElement.memberUid);
                    const memberUin = member?.uin;
                    // if (!memberUin) {
                    //     memberUin = (await NTQQUserApi.getUserDetailInfo(groupElement.memberUid)).uin
                    // }
                    // log("获取新群成员QQ", memberUin)
                    const adminMember = await NTQQGroupApi.getGroupMember(msg.peerUid, groupElement.adminUid);
                    // log("获取同意新成员入群的管理员", adminMember)
                    if (memberUin) {
                        const operatorUin = adminMember?.uin || memberUin;
                        // log("构造群增加事件", event)
                        return new OB11GroupIncreaseEvent(
                            core,
                            parseInt(msg.peerUid),
                            parseInt(memberUin),
                            parseInt(operatorUin)
                        );
                    }
                } else if (groupElement.type === TipGroupElementType.ban) {
                    logger.logDebug('收到群群员禁言提示', groupElement);
                    const memberUid = groupElement.shutUp!.member.uid;
                    const adminUid = groupElement.shutUp!.admin.uid;
                    let memberUin: string = '';
                    let duration = parseInt(groupElement.shutUp!.duration);
                    const subType: 'ban' | 'lift_ban' = duration > 0 ? 'ban' : 'lift_ban';
                    // log('OB11被禁言事件', adminUid);
                    if (memberUid) {
                        memberUin = (await NTQQGroupApi.getGroupMember(msg.peerUid, memberUid))?.uin || ''; // || (await NTQQUserApi.getUserDetailInfo(memberUid))?.uin
                    } else {
                        memberUin = '0';  // 0表示全员禁言
                        if (duration > 0) {
                            duration = -1;
                        }
                    }
                    const adminUin = (await NTQQGroupApi.getGroupMember(msg.peerUid, adminUid))?.uin; // || (await NTQQUserApi.getUserDetailInfo(adminUid))?.uin
                    // log('OB11被禁言事件', memberUin, adminUin, duration, subType);
                    if (memberUin && adminUin) {
                        return new OB11GroupBanEvent(
                            core,
                            parseInt(msg.peerUid),
                            parseInt(memberUin),
                            parseInt(adminUin),
                            duration,
                            subType
                        );
                    }
                } else if (groupElement.type == TipGroupElementType.kicked) {
                    logger.logDebug(`收到我被踢出或退群提示, 群${msg.peerUid}`, groupElement);
                    NTQQGroupApi.quitGroup(msg.peerUid).then();
                    try {
                        const adminUin = (await NTQQGroupApi.getGroupMember(msg.peerUid, groupElement.adminUid))?.uin || (await NTQQUserApi.getUidByUinV2(groupElement.adminUid));
                        if (adminUin) {
                            return new OB11GroupDecreaseEvent(
                                core,
                                parseInt(msg.peerUid),
                                parseInt(core.selfInfo.uin),
                                parseInt(adminUin),
                                'kick_me'
                            );
                        }
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
            if (grayTipElement) {
                //console.log('收到群提示消息', grayTipElement);
                if (grayTipElement.xmlElement?.templId === '10382') {
                    const emojiLikeData = new fastXmlParser.XMLParser({
                        ignoreAttributes: false,
                        attributeNamePrefix: '',
                    }).parse(grayTipElement.xmlElement.content);
                    logger.logDebug('收到表情回应我的消息', emojiLikeData);
                    try {
                        const senderUin = emojiLikeData.gtip.qq.jp;
                        const msgSeq = emojiLikeData.gtip.url.msgseq;
                        const emojiId = emojiLikeData.gtip.face.id;

                        const replyMsgList = (await NTQQMsgApi.getMsgsBySeqAndCount({
                            chatType: ChatType.group,
                            guildId: '',
                            peerUid: msg.peerUid,
                        }, msgSeq, 1, true, true)).msgList;
                        if (replyMsgList.length < 1) {
                            return;
                        }

                        const replyMsg = replyMsgList[0];
                        console.log('表情回应消息', msgSeq, ' 结算ID', replyMsg.msgId);
                        return new OB11GroupMsgEmojiLikeEvent(
                            core,
                            parseInt(msg.peerUid),
                            parseInt(senderUin),
                            MessageUnique.getShortIdByMsgId(replyMsg.msgId)!,
                            [{
                                emoji_id: emojiId,
                                count: 1,
                            }],
                        );
                    } catch (e: any) {
                        logger.logError('解析表情回应消息失败', e.stack);
                    }
                }
                if (grayTipElement.subElementType == GrayTipElementSubType.INVITE_NEW_MEMBER) {
                    logger.logDebug('收到新人被邀请进群消息', grayTipElement);
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
                                core,
                                parseInt(msg.peerUid),
                                parseInt(invitee),
                                parseInt(inviter),
                                'invite'
                            );
                        }
                    }
                }
                //代码歧义 GrayTipElementSubType.MEMBER_NEW_TITLE
                else if (grayTipElement.subElementType == GrayTipElementSubType.MEMBER_NEW_TITLE) {
                    const json = JSON.parse(grayTipElement.jsonGrayTipElement.jsonStr);
                    if (grayTipElement.jsonGrayTipElement.busiId == 1061) {
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
                    if (grayTipElement.jsonGrayTipElement.busiId == 2401) {
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
                    if (grayTipElement.jsonGrayTipElement.busiId == 2407) {
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

    static friend(friend: User): OB11User {
        return {
            user_id: parseInt(friend.uin),
            nickname: friend.nick,
            remark: friend.remark,
            sex: OB11Constructor.sex(friend.sex!),
            level: friend.qqLevel && calcQQLevel(friend.qqLevel) || 0,
        };
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
            age: 0,
            area: '',
            level: '0',
            qq_level: member.qqLevel && calcQQLevel(member.qqLevel) || 0,
            join_time: 0,  // 暂时没法获取
            last_sent_time: 0,  // 暂时没法获取
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
