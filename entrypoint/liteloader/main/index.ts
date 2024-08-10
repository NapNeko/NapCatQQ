import { BuddyListener, GroupListener, GroupMember, injectService, loadMessageUnique, LoginListener, MsgListener, NodeIKernelLoginService, ProfileListener, RawMessage } from '@/core';
import { NodeIQQNTWrapperSession, WrapperNodeApi } from '@/core/wrapper';
import { fetchServices, RegisterInitCallback } from './proxy';
import { INapCatService } from '@/core';
import { InitWebUi } from '@/webui';
import { DeviceList, NapCatOnebot11 } from '@/onebot11/main';
import { WebUiDataRuntime } from '@/webui/src/helper/Data';
import { log } from '@/common/utils/log';
import { groupMembers, groups, selfInfo, stat } from '@/core/data';
import { sleep } from '@/common/utils/helper';
import { requireMinNTQQBuild } from '@/common/utils/QQBasicInfo';

class NapCatLLPluginImpl extends INapCatService {
  checkAdminEvent(groupCode: string, memberNew: GroupMember, memberOld: GroupMember | undefined): boolean {
    if (memberNew.role !== memberOld?.role) {
      log(`群 ${groupCode} ${memberNew.nick} 角色变更为 ${memberNew.role === 3 ? '管理员' : '群员'}`);
      return true;
    }
    return false;
  }
  private initDataListener() {
    // 消息相关
    interface LineDevice {
      instanceId: number
      clientType: number
      devUid: string
    }
    interface KickedOffLineInfo {
      appId: number
      instanceId: number
      sameDevice: boolean
      tipsDesc: string
      tipsTitle: string
      kickedType: number
      securityKickedType: number
    }
    const msgListener = new MsgListener();
    msgListener.onLineDev = (Devices: LineDevice[]) => {
      DeviceList.splice(0, DeviceList.length);
      Devices.map((Device: LineDevice) => {
        const DeviceData = {
          app_id: Device.devUid,
          device_name: Device.clientType.toString(),
          device_kind: Device.clientType.toString(),
        };
        DeviceList.push(DeviceData);
        // if (Device.clientType === 2) {
        //   log('账号设备(' + Device.devUid + ') 在线状态变更');
        // }
      });
    };
    msgListener.onKickedOffLine = (Info: KickedOffLineInfo) => {
      // 下线通知
      log('[KickedOffLine] [' + Info.tipsTitle + '] ' + Info.tipsDesc);
    };
    // msgListener.onMsgInfoListUpdate = (msgInfoList: RawMessage[]) => {
    //   stat.packet_received += 1;
    //   msgInfoList.map(msg => {
    //      console.log("onMsgInfoListUpdate", msg);
    //     if (msg.recallTime === '0') {  // 不是撤回消息才入库/更新
    //       dbUtil.addMsg(msg).then().catch();
    //     }
    //     else {
    //       // 撤回的消息
    //       dbUtil.getMsgByLongId(msg.msgId).then(existMsg => {
    //         if (existMsg) {
    //           existMsg.recallTime = msg.recallTime;
    //           dbUtil.updateMsg(existMsg).then();
    //         }
    //       });
    //     }
    //   });
    // };
    msgListener.onAddSendMsg = (msg: RawMessage) => {
      stat.packet_sent += 1;
      stat.message_sent += 1;
      stat.last_message_time = Math.floor(Date.now() / 1000);
    };
    msgListener.onRecvMsg = (msgList: RawMessage[]) => {
      // console.log(JSON.stringify(msgList[0],null,2));
      stat.packet_received += 1;
      stat.message_received += msgList.length;
      stat.last_message_time = Math.floor(Date.now() / 1000);
    };
    msgListener.onRecvSysMsg = (...args) => {
      stat.packet_received += 1;
    };
    this.addListener(msgListener);
    // 好友相关 
    const buddyListener = new BuddyListener();


    this.addListener(buddyListener);
    // 刷新一次好友列表  26702版本以下需要手动刷新一次获取 高版本NTQQ自带缓存
    if (!requireMinNTQQBuild('26702')) {
      this.session.getBuddyService().getBuddyList(true).then(arg => {
        // console.log('getBuddyList', arg);
      });
    } else {
      // NTQQFriendApi.getBuddyV2(true).then((res) => {
      //   res.forEach((item) => {
      //     CachedIdMap.set(item.uid!, item.uin!);
      //   });
      // }).catch();
    }
    interface SelfStatusInfo {
      uid: string
      status: number
      extStatus: number
      termType: number
      netType: number
      iconType: number
      customStatus: any
      setTime: string
    }
    const profileListener = new ProfileListener();
    profileListener.onProfileDetailInfoChanged = (profile) => {
      if (profile.uid === selfInfo.uid) {
        Object.assign(selfInfo, profile);
      }
    };
    profileListener.onSelfStatusChanged = (Info: SelfStatusInfo) => {
      // if (Info.status == 20) {
      //   log("账号状态变更为离线")
      // }
    };
    this.addListener(profileListener);

    // 群相关
    const groupListener = new GroupListener();
    groupListener.onGroupListUpdate = (updateType, groupList) => {
      // console.log("onGroupListUpdate", updateType, groupList)
      groupList.map(g => {
        const existGroup = groups.get(g.groupCode);
        //群成员数量变化 应该刷新缓存
        if (existGroup && g.memberCount === existGroup.memberCount) {
          Object.assign(existGroup, g);
        }
        else {
          groups.set(g.groupCode, g);
          // 获取群成员
        }
        const sceneId = this.session.getGroupService().createMemberListScene(g.groupCode, 'groupMemberList_MainWindow');
        this.session.getGroupService().getNextMemberList(sceneId!, undefined, 3000).then(r => {
          // console.log(`get group ${g.groupCode} members`, r);
          // r.result.infos.forEach(member => {
          // });
          // groupMembers.set(g.groupCode, r.result.infos);
        });
      });
    };
    groupListener.onMemberListChange = (arg) => {
      // todo: 应该加一个内部自己维护的成员变动callback，用于判断成员变化通知
      const groupCode = arg.sceneId.split('_')[0];
      if (groupMembers.has(groupCode)) {
        const existMembers = groupMembers.get(groupCode)!;
        arg.infos.forEach((member, uid) => {
          //console.log('onMemberListChange', member);
          const existMember = existMembers.get(uid);
          if (existMember) {
            Object.assign(existMember, member);
          }
          else {
            existMembers!.set(uid, member);
          }
          //移除成员
          if (member.isDelete) {
            existMembers.delete(uid);
          }
        });
      }
      else {
        groupMembers.set(groupCode, arg.infos);
      }
      // console.log('onMemberListChange', groupCode, arg);
    };
    groupListener.onMemberInfoChange = (groupCode, changeType, members) => {
      //console.log('onMemberInfoChange', groupCode, changeType, members);
      if (changeType === 0 && members.get(selfInfo.uid)?.isDelete) {
        // 自身退群或者被踢退群 5s用于Api操作 之后不再出现
        setTimeout(() => {
          groups.delete(groupCode);
        }, 5000);

      }
      const existMembers = groupMembers.get(groupCode);
      if (existMembers) {
        members.forEach((member, uid) => {
          const existMember = existMembers.get(uid);
          if (existMember) {
            // 检查管理变动
            member.isChangeRole = this.checkAdminEvent(groupCode, member, existMember);
            // 更新成员信息
            Object.assign(existMember, member);
          }
          else {
            existMembers.set(uid, member);
          }
          //移除成员
          if (member.isDelete) {
            existMembers.delete(uid);
          }
        });
      }
      else {
        groupMembers.set(groupCode, members);
      }
    };
    this.addListener(groupListener);
  }
  constructor(session: NodeIQQNTWrapperSession, wrapper: WrapperNodeApi, loginService: NodeIKernelLoginService) {
    super(session, wrapper);
    const ntLoginListener = new LoginListener();
    ntLoginListener.onQRCodeLoginSucceed = async arg => {
      selfInfo.uin = arg.uin;
      selfInfo.uid = arg.uid;
      await new Promise<void>((resolve) => { RegisterInitCallback(() => resolve()); });
      //等待初始化
      this.initDataListener();
      loadMessageUnique().then().catch();
      this.onLoginSuccessFuncList.forEach(func => func(arg.uin, arg.uid));
    };
    loginService.addKernelLoginListener(
      new wrapper.NodeIKernelLoginListener(
        new Proxy(ntLoginListener, this.proxyHandler)
      )
    );
  }
}

async function init() {
  const {
    wrapperSession,
    wrapperNodeApi,
    wrapperLoginService
  } = await fetchServices();

  const service = new NapCatLLPluginImpl(wrapperSession, wrapperNodeApi, wrapperLoginService);
  injectService(service);
  service.onLoginSuccess((uin) => {
    log('登录成功!');
    WebUiDataRuntime.setQQLoginStatus(true);
    WebUiDataRuntime.setQQLoginUin(uin.toString());
  });
  await InitWebUi();
  //await new Promise<void>((resolve) => { RegisterInitCallback(() => resolve()); });
  const NapCat_OneBot11 = new NapCatOnebot11();
  await WebUiDataRuntime.setOB11ConfigCall(NapCat_OneBot11.SetConfig);
}

init();
