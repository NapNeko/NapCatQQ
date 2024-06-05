import fastXmlParser, { XMLParser } from 'fast-xml-parser';
import {
  OB11Group,
  OB11GroupMember,
  OB11GroupMemberRole,
  OB11Message,
  OB11MessageData,
  OB11MessageDataType,
  OB11User,
  OB11UserSex
} from './types';
import {
  AtType,
  ChatType,
  ElementType, FaceIndex,
  Friend,
  GrayTipElementSubType,
  Group,
  GroupMember,
  IMAGE_HTTP_HOST, IMAGE_HTTP_HOST_NT, mFaceCache,
  RawMessage,
  SelfInfo,
  Sex,
  TipGroupElementType,
  User
} from '@/core/entities';
import { EventType } from './event/OB11BaseEvent';
import { encodeCQCode } from './cqcode';
import { dbUtil } from '@/common/utils/db';
import { OB11GroupIncreaseEvent } from './event/notice/OB11GroupIncreaseEvent';
import { OB11GroupBanEvent } from './event/notice/OB11GroupBanEvent';
import { OB11GroupUploadNoticeEvent } from './event/notice/OB11GroupUploadNoticeEvent';
import { OB11GroupNoticeEvent } from './event/notice/OB11GroupNoticeEvent';
import { OB11FriendAddNoticeEvent } from './event/notice/OB11FriendAddNoticeEvent';

import { calcQQLevel } from '../common/utils/qqlevel';
import { log, logDebug, logError } from '../common/utils/log';
import { sleep } from '../common/utils/helper';
import { OB11GroupTitleEvent } from './event/notice/OB11GroupTitleEvent';
import { OB11GroupCardEvent } from './event/notice/OB11GroupCardEvent';
import { OB11GroupDecreaseEvent } from './event/notice/OB11GroupDecreaseEvent';
import { ob11Config } from '@/onebot11/config';
import { deleteGroup, getFriend, getGroupMember, groupMembers, selfInfo, tempGroupCodeMap } from '@/core/data';
import { NTQQFileApi, NTQQGroupApi, NTQQUserApi } from '@/core/apis';
import { OB11GroupMsgEmojiLikeEvent } from '@/onebot11/event/notice/OB11MsgEmojiLikeEvent';


export class OB11Constructor {
  static async message(msg: RawMessage): Promise<OB11Message> {
    const { messagePostFormat } = ob11Config;
    const message_type = msg.chatType == ChatType.group ? 'group' : 'private';
    const resMsg: OB11Message = {
      self_id: parseInt(selfInfo.uin),
      user_id: parseInt(msg.senderUin!),
      time: parseInt(msg.msgTime) || Date.now(),
      message_id: msg.id!,
      message_seq: msg.id!,
      real_id: msg.id!,
      message_type: msg.chatType == ChatType.group ? 'group' : 'private',
      sender: {
        user_id: parseInt(msg.senderUin!),
        nickname: msg.sendNickName,
        card: msg.sendMemberName || '',
      },
      raw_message: '',
      font: 14,
      sub_type: 'friend',
      message: messagePostFormat === 'string' ? '' : [],
      message_format: messagePostFormat === 'string' ? 'string' : 'array',
      post_type: selfInfo.uin == msg.senderUin ? EventType.MESSAGE_SENT : EventType.MESSAGE,
    };
    if (msg.chatType == ChatType.group) {
      resMsg.sub_type = 'normal'; // 这里go-cqhttp是group，而onebot11标准是normal, 蛋疼
      resMsg.group_id = parseInt(msg.peerUin);
      const member = await getGroupMember(msg.peerUin, msg.senderUin!);
      if (member) {
        resMsg.sender.role = OB11Constructor.groupMemberRole(member.role);
        resMsg.sender.nickname = member.nick;
      }
    }
    else if (msg.chatType == ChatType.friend) {
      resMsg.sub_type = 'friend';
      const friend = await getFriend(msg.senderUin!);
      if (friend) {
        resMsg.sender.nickname = friend.nick;
      }
    }
    else if (msg.chatType == ChatType.temp) {
      resMsg.sub_type = 'group';
      const tempGroupCode = tempGroupCodeMap[msg.peerUin];
      if (tempGroupCode) {
        resMsg.group_id = parseInt(tempGroupCode);
      }
    }
    for (const element of msg.elements) {
      const message_data: OB11MessageData | any = {
        data: {},
        type: 'unknown'
      };
      if (element.textElement && element.textElement?.atType !== AtType.notAt) {
        message_data['type'] = OB11MessageDataType.at;
        if (element.textElement.atType == AtType.atAll) {
          // message_data["data"]["mention"] = "all"
          message_data['data']['qq'] = 'all';
        }
        else {
          const atUid = element.textElement.atNtUid;
          let atQQ = element.textElement.atUid;
          if (!atQQ || atQQ === '0') {
            const atMember = await getGroupMember(msg.peerUin, atUid);
            if (atMember) {
              atQQ = atMember.uin;
            }
          }
          if (atQQ) {
            // message_data["data"]["mention"] = atQQ
            message_data['data']['qq'] = atQQ;
          }
        }
      }
      else if (element.textElement) {
        message_data['type'] = 'text';

        let text = element.textElement.content;
        if (!text.trim()) {
          continue;
        }
        // 兼容 9.7.x 换行符
        if (text.indexOf('\n') === -1 && text.indexOf('\r\n') === -1) {
          text = text.replace(/\r/g, '\n');
        }
        message_data['data']['text'] = text;
      }
      else if (element.replyElement) {
        message_data['type'] = 'reply';
        // log("收到回复消息", element.replyElement.replayMsgSeq)
        try {
          const replyMsg = await dbUtil.getMsgBySeq(msg.peerUid, element.replyElement.replayMsgSeq);
          // log("找到回复消息", replyMsg.msgShortId, replyMsg.msgId)
          if (replyMsg && replyMsg.id) {
            message_data['data']['id'] = replyMsg.id!.toString();
          }
          else {
            continue;
          }
        } catch (e: any) {
          logError('获取不到引用的消息', e.stack, element.replyElement.replayMsgSeq);
        }

      }
      else if (element.picElement) {
        message_data['type'] = 'image';
        // message_data["data"]["file"] = element.picElement.sourcePath
        message_data['data']['file'] = element.picElement.fileName;
        // message_data["data"]["path"] = element.picElement.sourcePath
        // let currentRKey = "CAQSKAB6JWENi5LMk0kc62l8Pm3Jn1dsLZHyRLAnNmHGoZ3y_gDZPqZt-64"

        try {
          message_data['data']['url'] = await NTQQFileApi.getImageUrl(element.picElement, msg.chatType !== ChatType.group);
        } catch (e: any) {
          logError('获取图片url失败', e.stack);
        }
        //console.log(message_data['data']['url'])
        // message_data["data"]["file_id"] = element.picElement.fileUuid
        message_data['data']['file_size'] = element.picElement.fileSize;
        dbUtil.addFileCache({
          name: element.picElement.fileName,
          path: element.picElement.sourcePath,
          size: element.picElement.fileSize,
          url: message_data['data']['url'],
          uuid: element.picElement.fileUuid || '',
          msgId: msg.msgId,
          element: element.picElement,
          elementType: ElementType.PIC,
          elementId: element.elementId
        }).then();
        // 不自动下载图片

      }
      else if (element.videoElement || element.fileElement) {
        const videoOrFileElement = element.videoElement || element.fileElement;
        const ob11MessageDataType = element.videoElement ? OB11MessageDataType.video : OB11MessageDataType.file;
        message_data['type'] = ob11MessageDataType;
        message_data['data']['file'] = videoOrFileElement.fileName;
        message_data['data']['path'] = videoOrFileElement.filePath;
        message_data['data']['file_id'] = videoOrFileElement.fileUuid;
        message_data['data']['file_size'] = videoOrFileElement.fileSize;
        // 怎么拿到url呢
        dbUtil.addFileCache({
          msgId: msg.msgId,
          name: videoOrFileElement.fileName,
          path: videoOrFileElement.filePath,
          size: parseInt(videoOrFileElement.fileSize || '0'),
          uuid: videoOrFileElement.fileUuid || '',
          url: '',
          element: element.videoElement || element.fileElement,
          elementType: element.videoElement ? ElementType.VIDEO : ElementType.FILE,
          elementId: element.elementId
        }).then();
      }
      else if (element.pttElement) {
        message_data['type'] = OB11MessageDataType.voice;
        message_data['data']['file'] = element.pttElement.fileName;
        message_data['data']['path'] = element.pttElement.filePath;
        // message_data["data"]["file_id"] = element.pttElement.fileUuid
        message_data['data']['file_size'] = element.pttElement.fileSize;
        dbUtil.addFileCache({
          name: element.pttElement.fileName,
          path: element.pttElement.filePath,
          size: parseInt(element.pttElement.fileSize) || 0,
          url: '',
          uuid: element.pttElement.fileUuid || '',
          msgId: msg.msgId,
          element: element.pttElement,
          elementType: ElementType.PTT,
          elementId: element.elementId
        }).then();

      }
      else if (element.arkElement) {
        message_data['type'] = OB11MessageDataType.json;
        message_data['data']['data'] = element.arkElement.bytesData;
      }
      else if (element.faceElement) {
        const faceId = element.faceElement.faceIndex;
        if (faceId === FaceIndex.dice) {
          message_data['type'] = OB11MessageDataType.dice;
          message_data['data']['result'] = element.faceElement.resultId;
        }
        else if (faceId === FaceIndex.RPS) {
          message_data['type'] = OB11MessageDataType.RPS;
          message_data['data']['result'] = element.faceElement.resultId;
        }
        else {
          message_data['type'] = OB11MessageDataType.face;
          message_data['data']['id'] = element.faceElement.faceIndex.toString();
        }
      }
      else if (element.marketFaceElement) {
        message_data['type'] = OB11MessageDataType.mface;
        message_data['data']['summary'] = element.marketFaceElement.faceName;
        const md5 = element.marketFaceElement.emojiId;
        // 取md5的前两位
        const dir = md5.substring(0, 2);
        // 获取组装url
        // const url = `https://p.qpic.cn/CDN_STATIC/0/data/imgcache/htdocs/club/item/parcel/item/${dir}/${md5}/300x300.gif?max_age=31536000`;
        const url = `https://gxh.vip.qq.com/club/item/parcel/item/${dir}/${md5}/raw300.gif`;
        message_data['data']['url'] = url;
        message_data['data']['emoji_id'] = element.marketFaceElement.emojiId;
        message_data['data']['emoji_package_id'] = String(element.marketFaceElement.emojiPackageId);
        message_data['data']['key'] = element.marketFaceElement.key;
        mFaceCache.set(md5, element.marketFaceElement.faceName);
      }
      else if (element.markdownElement) {
        message_data['type'] = OB11MessageDataType.markdown;
        message_data['data']['data'] = element.markdownElement.content;
      }
      else if (element.multiForwardMsgElement) {
        message_data['type'] = OB11MessageDataType.forward;
        message_data['data']['id'] = msg.msgId;
      }
      if (message_data.type !== 'unknown' && message_data.data) {
        const cqCode = encodeCQCode(message_data);
        if (messagePostFormat === 'string') {
          (resMsg.message as string) += cqCode;
        }
        else (resMsg.message as OB11MessageData[]).push(message_data);
        resMsg.raw_message += cqCode;
      }
    }
    resMsg.raw_message = resMsg.raw_message.trim();
    return resMsg;
  }

  static async GroupEvent(msg: RawMessage): Promise<OB11GroupNoticeEvent | undefined> {
    if (msg.chatType !== ChatType.group) {
      return;
    }
    if (msg.senderUin) {
      const member = await getGroupMember(msg.peerUid, msg.senderUin);
      if (member && member.cardName !== msg.sendMemberName) {
        const newCardName = msg.sendMemberName || '';
        const event = new OB11GroupCardEvent(parseInt(msg.peerUid), parseInt(msg.senderUin), newCardName, member.cardName);
        member.cardName = newCardName;
        return event;
      }
    }
    // log("group msg", msg);
    for (const element of msg.elements) {
      const grayTipElement = element.grayTipElement;
      const groupElement = grayTipElement?.groupElement;
      if (groupElement) {
        // log("收到群提示消息", groupElement)
        if (groupElement.type == TipGroupElementType.memberIncrease) {
          logDebug('收到群成员增加消息', groupElement);
          await sleep(1000);
          const member = await getGroupMember(msg.peerUid, groupElement.memberUid);
          const memberUin = member?.uin;
          // if (!memberUin) {
          //     memberUin = (await NTQQUserApi.getUserDetailInfo(groupElement.memberUid)).uin
          // }
          // log("获取新群成员QQ", memberUin)
          const adminMember = await getGroupMember(msg.peerUid, groupElement.adminUid);
          // log("获取同意新成员入群的管理员", adminMember)
          if (memberUin) {
            const operatorUin = adminMember?.uin || memberUin;
            const event = new OB11GroupIncreaseEvent(parseInt(msg.peerUid), parseInt(memberUin), parseInt(operatorUin));
            // log("构造群增加事件", event)
            return event;
          }
        }
        else if (groupElement.type === TipGroupElementType.ban) {
          logDebug('收到群群员禁言提示', groupElement);
          const memberUid = groupElement.shutUp!.member.uid;
          const adminUid = groupElement.shutUp!.admin.uid;
          let memberUin: string = '';
          let duration = parseInt(groupElement.shutUp!.duration);
          const sub_type: 'ban' | 'lift_ban' = duration > 0 ? 'ban' : 'lift_ban';
          // log('OB11被禁言事件', adminUid);
          if (memberUid) {
            memberUin = (await getGroupMember(msg.peerUid, memberUid))?.uin || ''; // || (await NTQQUserApi.getUserDetailInfo(memberUid))?.uin
          }
          else {
            memberUin = '0';  // 0表示全员禁言
            if (duration > 0) {
              duration = -1;
            }
          }
          const adminUin = (await getGroupMember(msg.peerUid, adminUid))?.uin; // || (await NTQQUserApi.getUserDetailInfo(adminUid))?.uin
          // log('OB11被禁言事件', memberUin, adminUin, duration, sub_type);
          if (memberUin && adminUin) {
            const event = new OB11GroupBanEvent(parseInt(msg.peerUid), parseInt(memberUin), parseInt(adminUin), duration, sub_type);
            return event;
          }
        }
        else if (groupElement.type == TipGroupElementType.kicked) {
          logDebug(`收到我被踢出或退群提示, 群${msg.peerUid}`, groupElement);
          deleteGroup(msg.peerUid);
          NTQQGroupApi.quitGroup(msg.peerUid).then();
          try {
            const adminUin = (await getGroupMember(msg.peerUid, groupElement.adminUid))?.uin || (await NTQQUserApi.getUidByUin(groupElement.adminUid));
            if (adminUin) {
              return new OB11GroupDecreaseEvent(parseInt(msg.peerUid), parseInt(selfInfo.uin), parseInt(adminUin), 'kick_me');
            }
          } catch (e) {
            return new OB11GroupDecreaseEvent(parseInt(msg.peerUid), parseInt(selfInfo.uin), 0, 'leave');
          }
        }
      }
      else if (element.fileElement) {
        return new OB11GroupUploadNoticeEvent(parseInt(msg.peerUid), parseInt(msg.senderUin || ''), {
          id: element.fileElement.fileUuid!,
          name: element.fileElement.fileName,
          size: parseInt(element.fileElement.fileSize),
          busid: element.fileElement.fileBizId || 0
        });
      }

      if (grayTipElement) {
        const xmlElement = grayTipElement.xmlElement;

        if (xmlElement?.templId === '10382') {
          // 表情回应消息
          // "content":
          //  "<gtip align=\"center\">
          //    <qq uin=\"u_snYxnEfja-Po_\" col=\"3\" jp=\"3794\"/>
          //    <nor txt=\"回应了你的\"/>
          //    <url jp= \"\" msgseq=\"74711\" col=\"3\" txt=\"消息:\"/>
          //    <face type=\"1\" id=\"76\">  </face>
          //  </gtip>",
          const emojiLikeData = new fastXmlParser.XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: ''
          }).parse(xmlElement.content);
          logDebug('收到表情回应我的消息', emojiLikeData);
          try {
            const senderUin = emojiLikeData.gtip.qq.jp;
            const msgSeq = emojiLikeData.gtip.url.msgseq;
            const emojiId = emojiLikeData.gtip.face.id;
            const replyMsg = await dbUtil.getMsgBySeq(msg.peerUid, msgSeq);
            if (!replyMsg) {
              return;
            }
            return new OB11GroupMsgEmojiLikeEvent(parseInt(msg.peerUid), parseInt(senderUin), replyMsg.id!, [{
              emoji_id: emojiId,
              count: 1
            }]);
          } catch (e: any) {
            logError('解析表情回应消息失败', e.stack);
          }
        }
        if (grayTipElement.subElementType == GrayTipElementSubType.INVITE_NEW_MEMBER) {
          logDebug('收到新人被邀请进群消息', grayTipElement);
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
              return new OB11GroupIncreaseEvent(parseInt(msg.peerUid), parseInt(invitee), parseInt(inviter), 'invite');
            }
          }
        }
        else if (grayTipElement.subElementType == GrayTipElementSubType.MEMBER_NEW_TITLE) {
          const json = JSON.parse(grayTipElement.jsonGrayTipElement.jsonStr);
          /*
            {
              align: 'center',
              items: [
                { txt: '恭喜', type: 'nor' },
                {
                  col: '3',
                  jp: '5',
                  param: ["QQ号"],
                  txt: '林雨辰',
                  type: 'url'
                },
                { txt: '获得群主授予的', type: 'nor' },
                {
                  col: '3',
                  jp: '',
                  txt: '好好好',
                  type: 'url'
                },
                { txt: '头衔', type: 'nor' }
              ]
            }

            * */
          const memberUin = json.items[1].param[0];
          const title = json.items[3].txt;
          logDebug('收到群成员新头衔消息', json);
          return new OB11GroupTitleEvent(parseInt(msg.peerUid), parseInt(memberUin), title);
        }
      }
    }
  }

  static async FriendAddEvent(msg: RawMessage): Promise<OB11FriendAddNoticeEvent | undefined> {
    if (msg.chatType !== ChatType.friend) {
      return;
    }
    if (msg.msgType === 5 && msg.subMsgType === 12) {
      const event = new OB11FriendAddNoticeEvent(parseInt(msg.peerUin));
      return event;
    }
    return;
  }

  static friend(friend: User): OB11User {
    return {
      user_id: parseInt(friend.uin),
      nickname: friend.nick,
      remark: friend.remark,
      sex: OB11Constructor.sex(friend.sex!),
      level: friend.qqLevel && calcQQLevel(friend.qqLevel) || 0
    };
  }

  static selfInfo(selfInfo: SelfInfo): OB11User {
    return {
      user_id: parseInt(selfInfo.uin),
      nickname: selfInfo.nick,
    };
  }

  static friends(friends: Friend[]): OB11User[] {
    const data: OB11User[] = [];
    friends.forEach(friend => {
      const sexValue = this.sex(friend.sex!);
      data.push({ user_id: parseInt(friend.uin), nickname: friend.nick, remark: friend.remark, sex: sexValue, level: 0 });
    });
    return data;
  }

  static groupMemberRole(role: number): OB11GroupMemberRole | undefined {
    return {
      4: OB11GroupMemberRole.owner,
      3: OB11GroupMemberRole.admin,
      2: OB11GroupMemberRole.member
    }[role];
  }

  static sex(sex: Sex): OB11UserSex {
    const sexMap = {
      [Sex.male]: OB11UserSex.male,
      [Sex.female]: OB11UserSex.female,
      [Sex.unknown]: OB11UserSex.unknown
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

  static groupMembers(group: Group): OB11GroupMember[] {
    //logDebug('construct ob11 group members', group);
    return Array.from(groupMembers.get(group.groupCode)?.values() || []).map(m => OB11Constructor.groupMember(group.groupCode, m));
  }

  static group(group: Group): OB11Group {
    return {
      group_id: parseInt(group.groupCode),
      group_name: group.groupName,
      member_count: group.memberCount,
      max_member_count: group.maxMember
    };
  }

  static groups(groups: Group[]): OB11Group[] {
    return groups.map(OB11Constructor.group);
  }
}
