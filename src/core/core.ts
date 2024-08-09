import QQWrapper, {
  NodeIQQNTWrapperEngine,
  NodeIQQNTWrapperSession,
  NodeQQNTWrapperUtil,
  WrapperNodeApi,
} from '@/core/wrapper';
import { DeviceList } from '@/onebot11/main';
import { NodeIKernelLoginService, passwordLoginArgType, QuickLoginResult } from '@/core/services';
import {
  BuddyListener,
  GroupListener,
  LoginListener,
  MsgListener,
  ProfileListener,
  SessionListener,
} from '@/core/listeners';
import { DependsAdapter, DispatcherAdapter, GlobalAdapter } from '@/core/adapters';
import path from 'node:path';
import os from 'node:os';
import fs from 'node:fs';
import { getFullQQVesion, QQVersionAppid, QQVersionQua, requireMinNTQQBuild } from '@/common/utils/QQBasicInfo';
import { hostname, systemVersion } from '@/common/utils/system';
import { genSessionConfig } from '@/core/sessionConfig';
import { sleep } from '@/common/utils/helper';
import crypto from 'node:crypto';
import { groupMembers, groups, selfInfo, stat } from '@/core/data';
import { GroupMember, RawMessage } from '@/core/entities';
import { NTEventDispatch } from '@/common/utils/EventTask';
import {
  enableConsoleLog,
  enableFileLog,
  log,
  logDebug,
  logError,
  setLogLevel,
  setLogSelfInfo,
} from '@/common/utils/log';
import { napCatConfig } from '@/core/utils/config';


export class INapCatService {
  session: NodeIQQNTWrapperSession;
  util: NodeQQNTWrapperUtil;

  constructor(
    session: NodeIQQNTWrapperSession,
    wrapper: WrapperNodeApi,
  ) {
    this.session = session;
    this.util = new wrapper.NodeQQNTWrapperUtil();
    NTEventDispatch.init({
      ListenerMap: wrapper,
      WrapperSession: session,
    });
  }

  get dataPath(): string {
    let result = this.util.getNTUserDataInfoConfig();
    if (!result) {
      result = path.resolve(os.homedir(), './.config/QQ');
      fs.mkdirSync(result, { recursive: true });
    }
    //console.log('dataPath', result);
    return result;
  }

  protected onLoginSuccessFuncList: OnLoginSuccess[] = [];

  protected proxyHandler = {
    get(target: any, prop: any, receiver: any) {
      // console.log('get', prop, typeof target[prop]);
      if (typeof target[prop] === 'undefined') {
        // 如果方法不存在，返回一个函数，这个函数调用existentMethod
        return (...args: unknown[]) => {
          logDebug(`${target.constructor.name} has no method ${prop}`);
        };
      }
      // 如果方法存在，正常返回
      return Reflect.get(target, prop, receiver);
    },
  };

  onLoginSuccess(func: OnLoginSuccess) {
    this.onLoginSuccessFuncList.push(func);
  }

  addListener(
    listener: BuddyListener | GroupListener | MsgListener | ProfileListener,
  ): number {
    // 根据listener的类型，找到对应的service，然后调用addListener方法
    // logDebug('addListener', listener.constructor.name);

    // proxy listener，调用 listener 不存在的方法时不会报错

    listener = new Proxy(listener, this.proxyHandler);
    switch (listener.constructor.name) {
      case 'BuddyListener': {
        return this.session.getBuddyService().addKernelBuddyListener(new QQWrapper.NodeIKernelBuddyListener(listener as BuddyListener));
      }
      case 'GroupListener': {
        return this.session.getGroupService().addKernelGroupListener(new QQWrapper.NodeIKernelGroupListener(listener as GroupListener));
      }
      case 'MsgListener': {
        return this.session.getMsgService().addKernelMsgListener(new QQWrapper.NodeIKernelMsgListener(listener as MsgListener));
      }
      case 'ProfileListener': {
        return this.session.getProfileService().addKernelProfileListener(new QQWrapper.NodeIKernelProfileListener(listener as ProfileListener));
      }
      default:
        return -1;
    }
  }
}

export interface OnLoginSuccess {
  (uin: string, uid: string): void | Promise<void>;
}

export class NapCatAppImpl extends INapCatService {
  public readonly engine: NodeIQQNTWrapperEngine;
  private readonly loginListener: LoginListener;

  private loginService: NodeIKernelLoginService;

  constructor() {
    super(new QQWrapper.NodeIQQNTWrapperSession(), QQWrapper);
    this.engine = new QQWrapper.NodeIQQNTWrapperEngine();
    this.loginService = new QQWrapper.NodeIKernelLoginService();
    this.loginListener = new LoginListener();
    this.loginListener.onUserLoggedIn = (userid: string) => {
      logError('当前账号(' + userid + ')已登录,无法重复登录');
    };
    this.initConfig();
    this.loginListener.onQRCodeLoginSucceed = (arg) => {
      this.initSession(arg.uin, arg.uid).then((r) => {
        selfInfo.uin = arg.uin;
        selfInfo.uid = arg.uid;
        napCatConfig.read();
        setLogLevel(napCatConfig.fileLogLevel, napCatConfig.consoleLogLevel);
        enableFileLog(napCatConfig.fileLog);
        enableConsoleLog(napCatConfig.consoleLog);
        setLogSelfInfo(selfInfo);
        const dataPath = path.resolve(this.dataPath, './NapCat/data');
        fs.mkdirSync(dataPath, { recursive: true });
        logDebug('本账号数据/缓存目录：', dataPath);
        this.initDataListener();
        this.onLoginSuccessFuncList.map(cb => {
          new Promise((resolve, reject) => {
            const result = cb(arg.uin, arg.uid);
            if (result instanceof Promise) {
              result.then(resolve).catch(reject);
            }
          }).then();
        });
      }).catch((e) => {
        logError('initSession failed', e);
        throw new Error(`启动失败: ${JSON.stringify(e)}`);
      });
    };
    // todo: 登录失败处理
    this.loginListener.onQRCodeSessionFailed = (errType: number, errCode: number, errMsg: string) => {
      logError('登录失败(onQRCodeSessionFailed)', errMsg);
      if (errType == 1 && errCode == 3) {
        // 二维码过期刷新
      }
      this.loginService.getQRCodePicture();
    };
    this.loginListener.onLoginFailed = (args) => {
      logError('登录失败(onLoginFailed)', args);
    };

    this.loginListener = new Proxy(this.loginListener, this.proxyHandler);
    // 初始化流程：initConfig, login, initSession, loginSuccess | initDataListener
    this.loginService.addKernelLoginListener(new QQWrapper.NodeIKernelLoginListener(this.loginListener));
  }

  get dataPathGlobal(): string {
    return path.resolve(this.dataPath, './nt_qq/global');
  }

  private initConfig() {
    this.engine.initWithDeskTopConfig({
      base_path_prefix: '',
      platform_type: 3,
      app_type: 4,
      app_version: getFullQQVesion(),
      os_version: 'Windows 10 Pro',
      use_xlog: true,
      qua: QQVersionQua,
      global_path_config: {
        desktopGlobalPath: this.dataPathGlobal,
      },
      thumb_config: { maxSide: 324, minSide: 48, longLimit: 6, density: 2 }
    }, new QQWrapper.NodeIGlobalAdapter(new GlobalAdapter()));
    this.loginService.initConfig({
      machineId: '',
      appid: QQVersionAppid,
      platVer: systemVersion,
      commonPath: this.dataPathGlobal,
      clientVer: getFullQQVesion(),
      hostName: hostname
    });
  }

  private initSession(uin: string, uid: string): Promise<number> {
    return new Promise(async (res, rej) => {

      const sessionConfig = await genSessionConfig(uin, uid, this.dataPath);
      const sessionListener = new SessionListener();
      sessionListener.onSessionInitComplete = (r: unknown) => {
        if ((r as number) === 0) {
          return res(0);
        }
        rej(r);
      };
      // const oldOnSendOidbRepl = this.session.onSendOidbRepl;
      // this.session.onSendOidbRepl = (...args: unknown[]) => {
      //   console.log('onSendOidbRepl', args);
      //   return oldOnSendOidbRepl(...args);
      // };
      this.session.init(sessionConfig,
        new QQWrapper.NodeIDependsAdapter(new DependsAdapter()),
        new QQWrapper.NodeIDispatcherAdapter(new DispatcherAdapter()),
        new QQWrapper.NodeIKernelSessionListener(sessionListener)
      );
      try {
        this.session.startNT(0);
      } catch (__) { /* Empty */
        try {
          this.session.startNT();
        } catch (e) {
          rej('init failed ' + e);
        }
      }
    });
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

  async quickLogin(uin: string): Promise<QuickLoginResult> {
    const loginList = await this.loginService.getLoginList();

    if (loginList.result !== 0) throw new Error('没有可快速登录的QQ号');
    const currentLogin = loginList.LocalLoginInfoList.find((item) => item.uin === uin);
    if (!currentLogin || !currentLogin?.isQuickLogin) throw new Error(`${uin}快速登录不可用`);

    await sleep(1000);
    const loginRet = await this.loginService.quickLoginWithUin(uin);
    if (!loginRet.result) {
      throw new Error('快速登录失败 ' + loginRet.loginErrorInfo.errMsg);
    }
    return loginRet;
  }

  async qrLogin(cb: (url: string, base64: string, buffer: Buffer) => Promise<void>) {
    return new Promise<{ url: string, base64: string, buffer: Buffer }>((resolve, reject) => {
      this.loginListener.onQRCodeGetPicture = (arg) => {
        const base64Data = arg.pngBase64QrcodeData.split('data:image/png;base64,')[1];
        const buffer = Buffer.from(base64Data, 'base64');
        cb(arg.qrcodeUrl, arg.pngBase64QrcodeData, buffer);
      };
      this.loginService.getQRCodePicture();
    });
  }

  async passwordLogin(uin: string, password: string, proofSig?: string, proofRand?: string, proofSid?: string) {
    const passwordMd5 = crypto.createHash('md5').update(password).digest('hex');
    const loginArg: passwordLoginArgType = {
      uin,
      passwordMd5,
      step: proofSig && proofRand && proofSid ? 1 : 0,
      newDeviceLoginSig: '',
      proofWaterSig: proofSig || '',
      proofWaterRand: proofRand || '',
      proofWaterSid: proofSid || ''
    };

    await this.loginService.getLoginList();
    await sleep(1000);

    const ret = await this.loginService.passwordLogin(loginArg);

    switch (ret.result) {
    case '0': { // Success
      break;
    }
    case '140022008': { // CAPTCHA required
      break;
    }
    case '4': // Mobile verify required
    case '140022013': // Incorrect password
    default:
    }
  }
  async getQuickLoginList() {
    const loginList = await this.loginService.getLoginList();
    return loginList;
  }
  checkAdminEvent(groupCode: string, memberNew: GroupMember, memberOld: GroupMember | undefined): boolean {
    if (memberNew.role !== memberOld?.role) {
      log(`群 ${groupCode} ${memberNew.nick} 角色变更为 ${memberNew.role === 3 ? '管理员' : '群员'}`);
      return true;
    }
    return false;
  }
}


