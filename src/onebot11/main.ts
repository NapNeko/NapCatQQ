import { napCatCore } from '@/core';
import { MsgListener } from '@/core/listeners';
import { OB11Constructor } from '@/onebot11/constructor';
import { postOB11Event } from '@/onebot11/server/postOB11Event';
import {
  ChatType,
  FriendRequest,
  Group,
  GroupMember,
  GroupMemberRole,
  GroupNotify,
  GroupNotifyTypes,
  KickedOffLineInfo,
  RawMessage
} from '@/core/entities';
import { OB11Config, ob11Config } from '@/onebot11/config';
import { httpHeart, ob11HTTPServer } from '@/onebot11/server/http';
import { ob11WebsocketServer } from '@/onebot11/server/ws/WebsocketServer';
import { ob11ReverseWebsockets } from '@/onebot11/server/ws/ReverseWebsocket';
import { friendRequests, getFriend, getGroup, getGroupMember, groupNotifies, selfInfo, uid2UinMap } from '@/core/data';
import { dbUtil } from '@/core/utils/db';
import { BuddyListener, GroupListener, NodeIKernelBuddyListener } from '@/core/listeners';
import { OB11FriendRequestEvent } from '@/onebot11/event/request/OB11FriendRequest';
import { NTQQGroupApi, NTQQUserApi } from '@/core/apis';
import { log, logDebug, logError, setLogSelfInfo } from '@/common/utils/log';
import { OB11GroupRequestEvent } from '@/onebot11/event/request/OB11GroupRequest';
import { OB11GroupAdminNoticeEvent } from '@/onebot11/event/notice/OB11GroupAdminNoticeEvent';
import { GroupDecreaseSubType, OB11GroupDecreaseEvent } from '@/onebot11/event/notice/OB11GroupDecreaseEvent';
import { OB11FriendRecallNoticeEvent } from '@/onebot11/event/notice/OB11FriendRecallNoticeEvent';
import { OB11GroupRecallNoticeEvent } from '@/onebot11/event/notice/OB11GroupRecallNoticeEvent';
import { logMessage, logNotice, logRequest } from '@/onebot11/log';
import { OB11Message } from '@/onebot11/types';
import { OB11LifeCycleEvent } from './event/meta/OB11LifeCycleEvent';
import { Data as SysData } from '@/proto/SysMessage'
import { OB11FriendPokeEvent, OB11GroupPokeEvent } from './event/notice/OB11PokeEvent';
export class NapCatOnebot11 {
  private bootTime: number = Date.now() / 1000;  // 秒


  constructor() {
    // console.log('ob11 init');
    napCatCore.onLoginSuccess(this.onReady.bind(this));
  }

  public onReady() {
    logDebug('ob11 ready');
    ob11Config.read();
    const serviceInfo = `
    HTTP服务 ${ob11Config.http.enable ? '已启动' : '未启动'}, ${ob11Config.http.host}:${ob11Config.http.port}
    HTTP上报服务 ${ob11Config.http.enablePost ? '已启动' : '未启动'}, 上报地址: ${ob11Config.http.postUrls}
    WebSocket服务 ${ob11Config.ws.enable ? '已启动' : '未启动'}, ${ob11Config.ws.host}:${ob11Config.ws.port}
    WebSocket反向服务 ${ob11Config.reverseWs.enable ? '已启动' : '未启动'}, 反向地址: ${ob11Config.reverseWs.urls}
    `;
    log(serviceInfo);
    NTQQUserApi.getUserDetailInfo(selfInfo.uid).then(user => {
      selfInfo.nick = user.nick;
      setLogSelfInfo(selfInfo);
    }).catch(logError);
    if (ob11Config.http.enable) {
      ob11HTTPServer.start(ob11Config.http.port, ob11Config.http.host);
    }
    if (ob11Config.ws.enable) {
      ob11WebsocketServer.start(ob11Config.ws.port, ob11Config.ws.host);
    }
    if (ob11Config.reverseWs.enable) {
      ob11ReverseWebsockets.start();
    }
    if (ob11Config.http.enableHeart) {
      // 启动http心跳
      httpHeart.start();
    }
    // MsgListener
    const msgListener = new MsgListener();
    msgListener.onRecvSysMsg = (protobufData: number[]) => {
      // let Data: Data = {
      //   header: {
      //     GroupNumber: 0,
      //     GroupString: '',
      //     QQ: 0,
      //     Uid: '',
      //   },
      //   Body: {
      //     MsgType: 0,
      //     SubType_0: 0,
      //     SubType_1: 0,
      //     MsgSeq: 0,
      //     Time: 0,
      //     MsgID: 0,
      //     Other: 0,
      //   }
      // };
      try {
        let sysMsg = SysData.fromBinary(Buffer.from(protobufData));
        let peeruin = sysMsg.header[0].groupNumber;
        let peeruid = sysMsg.header[0].groupString;
        let MsgType = sysMsg.body[0].msgType;
        let subType0 = sysMsg.body[0].subType0;
        let subType1 = sysMsg.body[0].subType1;
        let pokeEvent: OB11FriendPokeEvent | OB11GroupPokeEvent
        if (MsgType == 528 && subType0 == 290) {
          log("[私聊] 用户 ", peeruin, " 对你戳一戳");
          pokeEvent = new OB11FriendPokeEvent(peeruin);
          postOB11Event(pokeEvent)
          //私聊戳一戳
        }
        if (MsgType == 732 && subType0 == 20) {
          log("[群聊] 群组 ", peeruin, " 戳一戳");
          pokeEvent = new OB11GroupPokeEvent(peeruin);
          postOB11Event(pokeEvent)
          //群聊戳一戳
        }
      } catch (e) {
        log("解析SysMsg异常", e);
        // console.log(e);
        //
      }
    };
    msgListener.onKickedOffLine = (Info: KickedOffLineInfo) => {
      // 下线通知
      //postOB11Event
    };
    msgListener.onRecvMsg = (msg) => {
      // console.log('ob11 onRecvMsg', JSON.stringify(msg, null, 2));
      logDebug('收到消息', msg);
      for (const m of msg) {
        // try: 减掉3s 试图修复消息半天收不到
        if (this.bootTime - 3 > parseInt(m.msgTime)) {
          logDebug(`消息时间${m.msgTime}早于启动时间${this.bootTime}，忽略上报`);
          continue;
        }
        new Promise((resolve) => {
          dbUtil.addMsg(m).then(msgShortId => {
            m.id = msgShortId;
            this.postReceiveMsg([m]).then().catch(logError);
          }).catch(logError);
        }).then();
      }
    };
    msgListener.onMsgInfoListUpdate = (msgList) => {
      this.postRecallMsg(msgList).then().catch(logError);
    };
    msgListener.onAddSendMsg = (msg) => {
      OB11Constructor.message(msg).then((_msg) => {
        _msg.target_id = parseInt(msg.peerUin);
        logMessage(_msg as OB11Message).then().catch(logError);
      }).catch(logError);
      if (ob11Config.reportSelfMessage) {
        dbUtil.addMsg(msg).then(id => {
          msg.id = id;
          this.postReceiveMsg([msg]).then().catch(logError);
        });
      }
    };
    napCatCore.addListener(msgListener);
    logDebug('ob11 msg listener added');

    // BuddyListener
    const buddyListener = new BuddyListener();
    buddyListener.onBuddyReqChange = ((req) => {
      //从这里获取?好友请求
      this.postFriendRequest(req.buddyReqs).then().catch(logError);
    });
    napCatCore.addListener(buddyListener);
    logDebug('ob11 buddy listener added');

    // GroupListener
    const groupListener = new GroupListener();
    groupListener.onGroupNotifiesUpdated = async (doubt, notifies) => {
      //console.log('ob11 onGroupNotifiesUpdated', notifies[0]);
      this.postGroupNotifies(notifies).then().catch(e => logError('postGroupNotifies error: ', e));
    };
    groupListener.onMemberInfoChange = async (groupCode: string, changeType: number, members: Map<string, GroupMember>) => {
      // 如果自身是非管理员也许要从这里获取Delete 成员变动 待测试与验证
      let role = (await getGroupMember(groupCode, selfInfo.uin))?.role;
      let isPrivilege = role === 3 || role === 4;
      for (const member of members.values()) {
        if (member?.isDelete && !isPrivilege) {
          const groupDecreaseEvent = new OB11GroupDecreaseEvent(parseInt(groupCode), parseInt(member.uin), 0, 'leave');// 不知道怎么出去的
          postOB11Event(groupDecreaseEvent, true);
        }
      }
    }
    groupListener.onJoinGroupNotify = (...notify) => {
      // console.log('ob11 onJoinGroupNotify', notify);
    };
    groupListener.onGroupListUpdate = (updateType, groupList) => {
      // console.log('ob11 onGroupListUpdate', updateType, groupList);
      // this.postGroupMemberChange(groupList).then();
    };

    napCatCore.addListener(groupListener);
    logDebug('ob11 group listener added');
  }

  async postReceiveMsg(msgList: RawMessage[]) {
    const { debug, reportSelfMessage } = ob11Config;
    for (const message of msgList) {
      logDebug('收到新消息', message);
      // if (message.senderUin !== selfInfo.uin){
      // message.msgShortId = await dbUtil.addMsg(message);
      // }
      OB11Constructor.message(message).then((msg) => {
        logDebug('收到消息: ', msg);
        if (debug) {
          msg.raw = message;
        } else {
          if (msg.message.length === 0) {
            return;
          }
        }
        if (msg.post_type === 'message') {
          logMessage(msg as OB11Message).then().catch(logError);
        } else if (msg.post_type === 'notice') {
          logNotice(msg).then().catch(logError);
        } else if (msg.post_type === 'request') {
          logRequest(msg).then().catch(logError);
        }
        const isSelfMsg = msg.user_id.toString() == selfInfo.uin;
        if (isSelfMsg && !reportSelfMessage) {
          return;
        }
        if (isSelfMsg) {
          msg.target_id = parseInt(message.peerUin);
        }
        postOB11Event(msg);
        // log("post msg", msg)
      }).catch(e => logError('constructMessage error: ', e));
      OB11Constructor.GroupEvent(message).then(groupEvent => {
        if (groupEvent) {
          // log("post group event", groupEvent);
          postOB11Event(groupEvent);
        }
      }).catch(e => logError('constructGroupEvent error: ', e));
      OB11Constructor.FriendAddEvent(message).then(friendAddEvent => {
        if (friendAddEvent) {
          postOB11Event(friendAddEvent);
        }
      }).catch(e => logError('constructFriendAddEvent error: ', e));
    }
  }
  async SetConfig(NewOb11: OB11Config) {
    try {
      function isEqual(obj1: any, obj2: any) {
        if (obj1 === obj2) return true;
        if (obj1 == null || obj2 == null) return false;
        if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return obj1 === obj2;

        const keys1 = Object.keys(obj1);
        const keys2 = Object.keys(obj2);

        if (keys1.length !== keys2.length) return false;

        for (let key of keys1) {
          if (!isEqual(obj1[key], obj2[key])) return false;
        }
        return true;
      }
      // if (!NewOb11 || typeof NewOb11 !== 'object') {
      //   throw new Error('Invalid configuration object');
      // }

      // 先设置
      ob11Config.save(NewOb11);

      const isHttpChanged = !isEqual(NewOb11.http.port, ob11Config.http.port) && NewOb11.http.enable;
      const isHttpEnableChanged = !isEqual(NewOb11.http.enable, ob11Config.http.enable);

      const isHttpPostChanged = !isEqual(NewOb11.http.postUrls, ob11Config.http.postUrls);
      const isEnanleHttpPostChanged = !isEqual(NewOb11.http.enablePost, ob11Config.http.enablePost);

      const isWsChanged = !isEqual(NewOb11.ws.port, ob11Config.ws.port);
      const isEnableWsChanged = !isEqual(NewOb11.ws.enable, ob11Config.ws.enable);

      const isEnableWsReverseChanged = !isEqual(NewOb11.reverseWs.enable, ob11Config.reverseWs.enable);
      const isWsReverseUrlsChanged = !isEqual(NewOb11.reverseWs.urls, ob11Config.reverseWs.urls);

      const isEnableHeartBeatChanged = !isEqual(NewOb11.heartInterval, ob11Config.heartInterval);
      // http重启逻辑
      if (isHttpChanged) {
        ob11HTTPServer.restart(NewOb11.http.port, NewOb11.http.host);
      }

      if (isHttpEnableChanged) {
        if (NewOb11.http.enable) {
          ob11HTTPServer.start(NewOb11.http.port, NewOb11.http.host);
        } else {
          ob11HTTPServer.stop();
        }
      }
      // http post重启逻辑

      // if(isHttpPostChanged){
      //   logDebug('http post urls changed, restart http server');
      // }
      // if(isEnanleHttpPostChanged){
      //   logDebug('http post enable changed, restart http server');
      // }

      // ws重启逻辑
      if (isWsChanged) {
        ob11WebsocketServer.restart(NewOb11.ws.port);
      }

      if (isEnableWsChanged) {
        if (NewOb11.ws.enable) {
          ob11WebsocketServer.start(NewOb11.ws.port, NewOb11.ws.host);
        } else {
          ob11WebsocketServer.stop();
        }
      }

      // 反向ws重启逻辑
      if (isEnableWsReverseChanged) {
        if (NewOb11.reverseWs.enable) {
          ob11ReverseWebsockets.start();
        } else {
          ob11ReverseWebsockets.stop();
        }
      }
    } catch (e) {
      logError('热重载配置失败', e);
    }

  }
  async postGroupNotifies(notifies: GroupNotify[]) {
    for (const notify of notifies) {
      try {
        notify.time = Date.now();
        const notifyTime = parseInt(notify.seq) / 1000 / 1000;
        // log(`群通知时间${notifyTime}`, `启动时间${this.bootTime}`);
        if (notifyTime < this.bootTime) {
          continue;
        }
        const flag = notify.group.groupCode + '|' + notify.seq;
        const existNotify = groupNotifies[flag];
        if (existNotify) {
          continue;
        }
        logDebug('收到群通知', notify);
        groupNotifies[flag] = notify;
        // let member2: GroupMember;
        // if (notify.user2.uid) {
        //     member2 = await getGroupMember(notify.group.groupCode, null, notify.user2.uid);
        // }

        if ([GroupNotifyTypes.ADMIN_SET, GroupNotifyTypes.ADMIN_UNSET, GroupNotifyTypes.ADMIN_UNSET_OTHER].includes(notify.type)) {
          const member1 = await getGroupMember(notify.group.groupCode, notify.user1.uid);
          logDebug('有管理员变动通知');
          // refreshGroupMembers(notify.group.groupCode).then();
          const groupAdminNoticeEvent = new OB11GroupAdminNoticeEvent();
          groupAdminNoticeEvent.group_id = parseInt(notify.group.groupCode);
          logDebug('开始获取变动的管理员');
          if (member1) {
            logDebug('变动管理员获取成功');
            groupAdminNoticeEvent.user_id = parseInt(member1.uin);
            groupAdminNoticeEvent.sub_type = [GroupNotifyTypes.ADMIN_UNSET, GroupNotifyTypes.ADMIN_UNSET_OTHER].includes(notify.type) ? 'unset' : 'set';
            // member1.role = notify.type == GroupNotifyTypes.ADMIN_SET ? GroupMemberRole.admin : GroupMemberRole.normal;
            postOB11Event(groupAdminNoticeEvent, true);
          } else {
            logDebug('获取群通知的成员信息失败', notify, getGroup(notify.group.groupCode));
          }
        } else if (notify.type == GroupNotifyTypes.MEMBER_EXIT || notify.type == GroupNotifyTypes.KICK_MEMBER) {
          logDebug('有成员退出通知', notify);
          try {
            const member1 = await NTQQUserApi.getUserDetailInfo(notify.user1.uid);
            let operatorId = member1.uin;
            let subType: GroupDecreaseSubType = 'leave';
            if (notify.user2.uid) {
              // 是被踢的
              const member2 = await getGroupMember(notify.group.groupCode, notify.user2.uid);
              if (member2) {
                operatorId = member2.uin;
              }
              subType = 'kick';
            }
            const groupDecreaseEvent = new OB11GroupDecreaseEvent(parseInt(notify.group.groupCode), parseInt(member1.uin), parseInt(operatorId), subType);
            postOB11Event(groupDecreaseEvent, true);
          } catch (e: any) {
            logError('获取群通知的成员信息失败', notify, e.stack.toString());
          }
        } else if ([GroupNotifyTypes.JOIN_REQUEST].includes(notify.type)) {
          logDebug('有加群请求');
          const groupRequestEvent = new OB11GroupRequestEvent();
          groupRequestEvent.group_id = parseInt(notify.group.groupCode);
          let requestQQ = '';
          try {
            requestQQ = (await NTQQUserApi.getUserDetailInfo(notify.user1.uid)).uin;
          } catch (e) {
            logError('获取加群人QQ号失败', e);
          }
          groupRequestEvent.user_id = parseInt(requestQQ) || 0;
          groupRequestEvent.sub_type = 'add';
          groupRequestEvent.comment = notify.postscript;
          groupRequestEvent.flag = flag;
          postOB11Event(groupRequestEvent);
        } else if (notify.type == GroupNotifyTypes.INVITE_ME) {
          logDebug('收到邀请我加群通知');
          const groupInviteEvent = new OB11GroupRequestEvent();
          groupInviteEvent.group_id = parseInt(notify.group.groupCode);
          let user_id = (await getFriend(notify.user2.uid))?.uin;
          if (!user_id) {
            user_id = (await NTQQUserApi.getUserDetailInfo(notify.user2.uid))?.uin;
          }
          groupInviteEvent.user_id = parseInt(user_id);
          groupInviteEvent.sub_type = 'invite';
          groupInviteEvent.flag = flag;
          postOB11Event(groupInviteEvent);
        }
      } catch (e: any) {
        logDebug('解析群通知失败', e.stack.toString());
      }
    }

  }

  async postRecallMsg(msgList: RawMessage[]) {
    for (const message of msgList) {
      // log("message update", message.sendStatus, message.msgId, message.msgSeq)
      if (message.recallTime != '0') { //todo: 这个判断方法不太好，应该使用灰色消息元素来判断?
        // 撤回消息上报
        const oriMessage = await dbUtil.getMsgByLongId(message.msgId);
        if (!oriMessage) {
          continue;
        }
        if (message.chatType == ChatType.friend) {
          const friendRecallEvent = new OB11FriendRecallNoticeEvent(parseInt(message!.senderUin), oriMessage!.id!);
          postOB11Event(friendRecallEvent);
        } else if (message.chatType == ChatType.group) {
          let operatorId = message.senderUin;
          for (const element of message.elements) {
            const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
            const operator = await getGroupMember(message.peerUin, operatorUid);
            operatorId = operator?.uin || message.senderUin;
          }
          const groupRecallEvent = new OB11GroupRecallNoticeEvent(
            parseInt(message.peerUin),
            parseInt(message.senderUin),
            parseInt(operatorId),
            oriMessage.id!
          );
          postOB11Event(groupRecallEvent);
        }
      }
    }
  }

  async postFriendRequest(reqs: FriendRequest[]) {
    for (const req of reqs) {
      if (parseInt(req.reqTime) < this.bootTime) {
        continue;
      }
      const flag = req.friendUid + '|' + req.reqTime;
      if (friendRequests[flag]) {
        continue;
      }
      friendRequests[flag] = req;
      const friendRequestEvent = new OB11FriendRequestEvent();
      try {
        const requester = await NTQQUserApi.getUserDetailInfo(req.friendUid);
        friendRequestEvent.user_id = parseInt(requester.uin);
      } catch (e) {
        logDebug('获取加好友者QQ号失败', e);
      }
      friendRequestEvent.flag = flag;
      friendRequestEvent.comment = req.extWords;
      postOB11Event(friendRequestEvent);
    }
  }

  // async postGroupMemberChange(groupList: Group[]) {
  //   // todo: 有无更好的方法判断群成员变动
  //   const newGroupList = groupList;
  //   for (const group of newGroupList) {
  //     const existGroup = await getGroup(group.groupCode);
  //     if (existGroup) {
  //       if (existGroup.memberCount > group.memberCount) {
  //         log(`群(${group.groupCode})成员数量减少${existGroup.memberCount} -> ${group.memberCount}`);
  //         const oldMembers = existGroup.members;
  //         const newMembers = await NTQQGroupApi.getGroupMembers(group.groupCode);
  //         group.members = newMembers;
  //         const newMembersSet = new Set<string>();  // 建立索引降低时间复杂度
  //
  //         for (const member of newMembers) {
  //           newMembersSet.add(member.uin);
  //         }
  //
  //         // 判断bot是否是管理员，如果是管理员不需要从这里得知有人退群，这里的退群无法得知是主动退群还是被踢
  //         const bot = await getGroupMember(group.groupCode, selfInfo.uin);
  //         if (bot!.role == GroupMemberRole.admin || bot!.role == GroupMemberRole.owner) {
  //           continue;
  //         }
  //         for (const member of oldMembers) {
  //           if (!newMembersSet.has(member.uin) && member.uin != selfInfo.uin) {
  //             postOB11Event(new OB11GroupDecreaseEvent(parseInt(group.groupCode), parseInt(member.uin), parseInt(member.uin), 'leave'));
  //             break;
  //           }
  //         }
  //       }
  //     }
  //   }
  // }
}

// export const napCatOneBot11 = new NapCatOnebot11();
