import {
  BuddyReqType,
  ChatType,
  GroupNotifyMsgStatus,
  GroupNotifyMsgType,
  InstanceContext,
  NapCatCore,
  NodeIKernelBuddyListener,
  NodeIKernelGroupListener,
  NodeIKernelMsgListener,
  Peer,
  RawMessage,
  SendStatusType,
  NTMsgType,
  MessageElement,
  ElementType,
  NTMsgAtType,
} from 'napcat-core';
import { OB11ConfigLoader } from '@/napcat-onebot/config';
import { pendingTokenToSend } from 'napcat-webui-backend/index';
import {
  OB11HttpClientAdapter,
  OB11WebSocketClientAdapter,
  OB11NetworkManager,
  OB11NetworkReloadType,
  OB11HttpServerAdapter,
  OB11WebSocketServerAdapter,
} from '@/napcat-onebot/network';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import {
  OneBotFriendApi,
  OneBotGroupApi,
  OneBotMsgApi,
  OneBotQuickActionApi,
  OneBotUserApi,
} from '@/napcat-onebot/api';
import { ActionMap, createActionMap } from '@/napcat-onebot/action';
import { WebUiDataRuntime } from 'napcat-webui-backend/src/helper/Data';
import { OB11InputStatusEvent } from '@/napcat-onebot/event/notice/OB11InputStatusEvent';
import { MessageUnique } from 'napcat-common/src/message-unique';
import { OB11FriendRequestEvent } from '@/napcat-onebot/event/request/OB11FriendRequest';
import { OB11GroupRequestEvent } from '@/napcat-onebot/event/request/OB11GroupRequest';
import { OB11FriendRecallNoticeEvent } from '@/napcat-onebot/event/notice/OB11FriendRecallNoticeEvent';
import { OB11GroupRecallNoticeEvent } from '@/napcat-onebot/event/notice/OB11GroupRecallNoticeEvent';
import { BotOfflineEvent } from './event/notice/BotOfflineEvent';
import {
  NetworkAdapterConfig,
  OneBotConfig,
  OneBotConfigSchema,
} from './config/config';
import { OB11Message } from './types';
import { existsSync } from 'node:fs';
import { IOB11NetworkAdapter } from '@/napcat-onebot/network/adapter';
import { OB11HttpSSEServerAdapter } from './network/http-server-sse';
import { OB11PluginMangerAdapter } from './network/plugin-manger';

import { proxiedListenerOf } from '@/napcat-core/helper/proxy-handler';
import { OneBotFileApi } from './api/file';

interface ApiListType {
  GroupApi: OneBotGroupApi;
  UserApi: OneBotUserApi;
  FriendApi: OneBotFriendApi;
  MsgApi: OneBotMsgApi;
  QuickActionApi: OneBotQuickActionApi;
  FileApi: OneBotFileApi;
}
// OneBot实现类
export class NapCatOneBot11Adapter {
  readonly core: NapCatCore;
  readonly context: InstanceContext;

  configLoader: OB11ConfigLoader;
  public apis: ApiListType;
  networkManager: OB11NetworkManager;
  actions: ActionMap;
  private readonly bootTime = Date.now() / 1000;
  recallEventCache = new Map<string, NodeJS.Timeout>();
  constructor (core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
    this.core = core;
    this.context = context;
    this.configLoader = new OB11ConfigLoader(core, pathWrapper.configPath, OneBotConfigSchema);
    this.apis = {
      GroupApi: new OneBotGroupApi(this, core),
      UserApi: new OneBotUserApi(this, core),
      FriendApi: new OneBotFriendApi(this, core),
      MsgApi: new OneBotMsgApi(this, core),
      QuickActionApi: new OneBotQuickActionApi(this, core),
      FileApi: new OneBotFileApi(this, core),
    } as const;
    this.actions = createActionMap(this, core);
    this.networkManager = new OB11NetworkManager();
  }

  async creatOneBotLog (ob11Config: OneBotConfig) {
    let log = '[network] 配置加载\n';
    for (const key of ob11Config.network.httpServers) {
      log += `HTTP服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    for (const key of ob11Config.network.httpSseServers) {
      log += `HTTP-SSE服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    for (const key of ob11Config.network.httpClients) {
      log += `HTTP上报服务: ${key.url}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    for (const key of ob11Config.network.websocketServers) {
      log += `WebSocket服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    for (const key of ob11Config.network.websocketClients) {
      log += `WebSocket反向服务: ${key.url}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    return log;
  }

  async InitOneBot () {
    const selfInfo = this.core.selfInfo;
    const ob11Config = this.configLoader.configData;
    this.core.apis.UserApi.getUserDetailInfo(selfInfo.uid, false)
      .then(async (user) => {
        selfInfo.nick = user.nick;
        this.context.logger.setLogSelfInfo(selfInfo);

        // 检查是否有待发送的token
        if (pendingTokenToSend) {
          this.context.logger.log('[NapCat] [OneBot] 🔐 检测到待发送的WebUI Token，开始发送');
          try {
            await this.core.apis.MsgApi.sendMsg(
              { chatType: ChatType.KCHATTYPEC2C, peerUid: selfInfo.uid, guildId: '' },
              [{
                elementType: ElementType.TEXT,
                elementId: '',
                textElement: {
                  content:
                    '[NapCat] 温馨提示:\n' +
                    'WebUI密码为默认密码，已进行强制修改\n' +
                    '新密码: ' + pendingTokenToSend,
                  atType: NTMsgAtType.ATTYPEUNKNOWN,
                  atUid: '',
                  atTinyId: '',
                  atNtUid: '',
                },
              }],
              5000
            );
            this.context.logger.log('[NapCat] [OneBot] ✅ WebUI Token 消息发送成功');
          } catch (error) {
            this.context.logger.logError('[NapCat] [OneBot] ❌ WebUI Token 消息发送失败:', error);
          }
        }

        WebUiDataRuntime.getQQLoginCallback()(true);
      })
      .catch(e => this.context.logger.logError(e));

    const serviceInfo = await this.creatOneBotLog(ob11Config);
    this.context.logger.log(`[Notice] [OneBot11] ${serviceInfo}`);

    // 创建NetWork服务

    // 检查插件目录是否存在，不存在则不加载插件管理器
    if (existsSync(this.context.pathWrapper.pluginPath)) {
      this.context.logger.log('[Plugins] 插件目录存在，开始加载插件');
      this.networkManager.registerAdapter(
        new OB11PluginMangerAdapter('plugin_manager', this.core, this, this.actions)
      );
    }
    for (const key of ob11Config.network.httpServers) {
      if (key.enable) {
        this.networkManager.registerAdapter(
          new OB11HttpServerAdapter(key.name, key, this.core, this, this.actions)
        );
      }
    }
    for (const key of ob11Config.network.httpSseServers) {
      if (key.enable) {
        this.networkManager.registerAdapter(
          new OB11HttpSSEServerAdapter(key.name, key, this.core, this, this.actions)
        );
      }
    }
    for (const key of ob11Config.network.httpClients) {
      if (key.enable) {
        this.networkManager.registerAdapter(
          new OB11HttpClientAdapter(key.name, key, this.core, this, this.actions)
        );
      }
    }
    for (const key of ob11Config.network.websocketServers) {
      if (key.enable) {
        this.networkManager.registerAdapter(
          new OB11WebSocketServerAdapter(
            key.name,
            key,
            this.core,
            this,
            this.actions
          )
        );
      }
    }
    for (const key of ob11Config.network.websocketClients) {
      if (key.enable) {
        this.networkManager.registerAdapter(
          new OB11WebSocketClientAdapter(
            key.name,
            key,
            this.core,
            this,
            this.actions
          )
        );
      }
    }
    await this.networkManager.openAllAdapters();

    this.initMsgListener();
    this.initBuddyListener();
    this.initGroupListener();

    WebUiDataRuntime.setQQVersion(this.core.context.basicInfoWrapper.getFullQQVersion());
    WebUiDataRuntime.setQQLoginInfo(selfInfo);
    WebUiDataRuntime.setQQLoginStatus(true);
    WebUiDataRuntime.setOnOB11ConfigChanged(async (newConfig) => {
      const prev = this.configLoader.configData;
      this.configLoader.save(newConfig);
      // this.context.logger.log(`OneBot11 配置更改：${JSON.stringify(prev)} -> ${JSON.stringify(newConfig)}`);
      await this.reloadNetwork(prev, newConfig);
    });
    this.apis.GroupApi.registerParseGroupReactEventByCore().catch(e =>
      this.context.logger.logError('注册群消息反应表情失败', e)
    );
  }

  private async reloadNetwork (prev: OneBotConfig, now: OneBotConfig): Promise<void> {
    const prevLog = await this.creatOneBotLog(prev);
    const newLog = await this.creatOneBotLog(now);
    this.context.logger.log(`[Notice] [OneBot11] 配置变更前:\n${prevLog}`);
    this.context.logger.log(`[Notice] [OneBot11] 配置变更后:\n${newLog}`);

    await this.handleConfigChange(prev.network.httpServers, now.network.httpServers, OB11HttpServerAdapter);
    await this.handleConfigChange(prev.network.httpClients, now.network.httpClients, OB11HttpClientAdapter);
    await this.handleConfigChange(prev.network.httpSseServers, now.network.httpSseServers, OB11HttpSSEServerAdapter);
    await this.handleConfigChange(prev.network.websocketServers, now.network.websocketServers, OB11WebSocketServerAdapter);
    await this.handleConfigChange(prev.network.websocketClients, now.network.websocketClients, OB11WebSocketClientAdapter);
  }

  private async handleConfigChange<CT extends NetworkAdapterConfig> (
    prevConfig: NetworkAdapterConfig[],
    nowConfig: NetworkAdapterConfig[],
    adapterClass: new (
      ...args: ConstructorParameters<typeof IOB11NetworkAdapter<CT>>
    ) => IOB11NetworkAdapter<CT>
  ): Promise<void> {
    // 比较旧的在新的找不到的回收
    for (const adapterConfig of prevConfig) {
      const existingAdapter = nowConfig.find((e) => e.name === adapterConfig.name);
      if (!existingAdapter) {
        const existingAdapter = this.networkManager.findSomeAdapter(adapterConfig.name);
        if (existingAdapter) {
          await this.networkManager.closeSomeAdaterWhenOpen([existingAdapter]);
        }
      }
    }
    // 通知新配置重载 删除关闭的 加入新开的
    for (const adapterConfig of nowConfig) {
      const existingAdapter = this.networkManager.findSomeAdapter(adapterConfig.name);
      if (existingAdapter) {
        const networkChange = await existingAdapter.reload(adapterConfig);
        if (networkChange === OB11NetworkReloadType.NetWorkClose) {
          await this.networkManager.closeSomeAdaterWhenOpen([existingAdapter]);
        }
      } else if (adapterConfig.enable) {
        // eslint-disable-next-line new-cap
        const newAdapter = new adapterClass(adapterConfig.name, adapterConfig as CT, this.core, this, this.actions);
        await this.networkManager.registerAdapterAndOpen(newAdapter);
      }
    }
  }

  private initMsgListener () {
    const msgListener = new NodeIKernelMsgListener();
    msgListener.onRecvSysMsg = (msg) => {
      this.apis.MsgApi.parseSysMessage(msg)
        .then((event) => {
          if (event) this.networkManager.emitEvent(event);
        })
        .catch((e) =>
          this.context.logger.logError(
            'constructSysMessage error: ',
            e,
            '\n Parse Hex:',
            Buffer.from(msg).toString('hex')
          )
        );
    };

    msgListener.onInputStatusPush = async (data) => {
      const uin = await this.core.apis.UserApi.getUinByUidV2(data.fromUin);
      this.context.logger.log(`[Notice] [输入状态] ${uin} ${data.statusText}`);
      await this.networkManager.emitEvent(
        new OB11InputStatusEvent(this.core, parseInt(uin), data.eventType, data.statusText)
      );
    };

    msgListener.onRecvMsg = async (msg) => {
      if (!this.networkManager.hasActiveAdapters()) {
        return;
      }
      for (const m of msg) {
        if (this.bootTime > parseInt(m.msgTime)) {
          this.context.logger.logDebug(`消息时间${m.msgTime}早于启动时间${this.bootTime}，忽略上报`);
          continue;
        }
        m.id = MessageUnique.createUniqueMsgId(
          {
            chatType: m.chatType,
            peerUid: m.peerUid,
            guildId: '',
          },
          m.msgId
        );
        await this.emitMsg(m).catch((e) =>
          this.context.logger.logError('处理消息失败', e)
        );
      }
    };

    /**
     * 加入在线文件的listener
     */
    msgListener.onRecvOnlineFileMsg = async (msg: RawMessage[]) => {
      if (!this.networkManager.hasActiveAdapters()) {
        return;
      }

      for (const m of msg) {
        // this.context.logger.logMessage(m, this.core.selfInfo);

        if (this.bootTime > parseInt(m.msgTime)) {
          this.context.logger.logDebug(`在线文件消息时间${m.msgTime}早于启动时间${this.bootTime}，忽略上报`);
          continue;
        }

        m.id = MessageUnique.createUniqueMsgId(
          {
            chatType: m.chatType,
            peerUid: m.peerUid,
            guildId: '',
          },
          m.msgId
        );

        await this.emitMsg(m).catch((e) =>
          this.context.logger.logError('处理在线文件消息失败', e)
        );
      }
    };

    msgListener.onAddSendMsg = async (msg) => {
      try {
        if (msg.sendStatus === SendStatusType.KSEND_STATUS_SENDING) {
          const [updatemsgs] = await this.core.eventWrapper.registerListen('NodeIKernelMsgListener/onMsgInfoListUpdate', (msgList: RawMessage[]) => {
            const report = msgList.find((e) =>
              e.senderUin === this.core.selfInfo.uin && e.sendStatus !== SendStatusType.KSEND_STATUS_SENDING && e.msgId === msg.msgId
            );
            return !!report;
          }, 1, 10 * 60 * 1000);
          // 10分钟 超时
          const updatemsg = updatemsgs.find((e) => e.msgId === msg.msgId);
          // updatemsg?.sendStatus == SendStatusType.KSEND_STATUS_SUCCESS_NOSEQ NOSEQ一般是服务器未下发SEQ 这意味着这条消息不应该推送network
          if (updatemsg?.sendStatus === SendStatusType.KSEND_STATUS_SUCCESS) {
            updatemsg.id = MessageUnique.createUniqueMsgId(
              {
                chatType: updatemsg.chatType,
                peerUid: updatemsg.peerUid,
                guildId: '',
              },
              updatemsg.msgId
            );
            this.emitMsg(updatemsg);
          }
        }
      } catch (error) {
        this.context.logger.logError('处理发送消息失败', error);
      }
    };
    msgListener.onMsgRecall = async (chatType: ChatType, uid: string, msgSeq: string) => {
      const peer: Peer = {
        chatType,
        peerUid: uid,
        guildId: '',
      };
      let msg = (await this.core.apis.MsgApi.queryMsgsWithFilterExWithSeq(peer, msgSeq)).msgList.find(e => e.msgType === NTMsgType.KMSGTYPEGRAYTIPS);
      const element = msg?.elements.find(e => !!e.grayTipElement?.revokeElement);
      if (msg && element?.grayTipElement?.revokeElement.isSelfOperate) {
        const isSelfDevice = this.recallEventCache.has(msg.msgId);
        if (isSelfDevice) {
          await this.core.eventWrapper.registerListen('NodeIKernelMsgListener/onMsgRecall',
            (chatType: ChatType, uid: string, msgSeq: string) => {
              return chatType === msg?.chatType && uid === msg?.peerUid && msgSeq === msg?.msgSeq;
            }
          ).catch(() => {
            msg = undefined;
            this.context.logger.logDebug('自操作消息撤回事件');
          });
        }
      }
      if (msg && element) {
        const recallEvent = await this.emitRecallMsg(msg, element);
        try {
          if (recallEvent) {
            await this.networkManager.emitEvent(recallEvent);
          }
        } catch (e) {
          this.context.logger.logError('处理消息撤回失败', e);
        }
      }
    };
    msgListener.onKickedOffLine = async (kick) => {
      WebUiDataRuntime.setQQLoginStatus(false);
      const event = new BotOfflineEvent(this.core, kick.tipsTitle, kick.tipsDesc);
      this.networkManager
        .emitEvent(event)
        .catch((e) => this.context.logger.logError('处理Bot掉线失败', e));
    };
    this.context.session.getMsgService().addKernelMsgListener(proxiedListenerOf(msgListener, this.context.logger));
  }

  private initBuddyListener () {
    const buddyListener = new NodeIKernelBuddyListener();

    buddyListener.onBuddyReqChange = async (reqs) => {
      this.core.apis.FriendApi.clearBuddyReqUnreadCnt();
      for (let i = 0; i < reqs.unreadNums; i++) {
        const req = reqs.buddyReqs[i];
        if (!req) continue;
        if (!!req.isInitiator || (req.isDecide && req.reqType !== BuddyReqType.KMEINITIATORWAITPEERCONFIRM) || !req.isUnread) {
          continue;
        }
        try {
          const requesterUin = await this.core.apis.UserApi.getUinByUidV2(req.friendUid);
          await this.networkManager.emitEvent(
            new OB11FriendRequestEvent(
              this.core,
              +requesterUin,
              req.extWords,
              req.reqTime
            )
          );
        } catch (e) {
          this.context.logger.logDebug('获取加好友者QQ号失败', e);
        }
      }
    };
    this.context.session
      .getBuddyService()
      .addKernelBuddyListener(proxiedListenerOf(buddyListener, this.context.logger));
  }

  private initGroupListener () {
    const groupListener = new NodeIKernelGroupListener();

    groupListener.onGroupNotifiesUpdated = async (_, notifies) => {
      await this.core.apis.GroupApi.clearGroupNotifiesUnreadCount(false);
      if (!notifies[0]?.type) return;
      if (
        ![
          GroupNotifyMsgType.SET_ADMIN,
          GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_CANCELED,
          GroupNotifyMsgType.CANCEL_ADMIN_NOTIFY_ADMIN,
        ].includes(notifies[0]?.type)
      ) {
        for (const notify of notifies) {
          const notifyTime = parseInt(notify.seq) / 1000 / 1000;
          // log(`群通知时间${notifyTime}`, `启动时间${this.bootTime}`);
          if (notifyTime < this.bootTime) {
            continue;
          }
          const flag = notify.seq;
          this.context.logger.logDebug('收到群通知', notify);
          if (
            [GroupNotifyMsgType.REQUEST_JOIN_NEED_ADMINI_STRATOR_PASS].includes(notify.type) &&
            notify.status === GroupNotifyMsgStatus.KUNHANDLE
          ) {
            this.context.logger.logDebug('有加群请求');
            try {
              const requestUin = await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid);
              const groupRequestEvent = new OB11GroupRequestEvent(
                this.core,
                parseInt(notify.group.groupCode),
                parseInt(requestUin),
                'add',
                notify.postscript,
                flag
              );
              this.networkManager
                .emitEvent(groupRequestEvent)
                .catch((e) =>
                  this.context.logger.logError('处理加群请求失败', e)
                );
            } catch (e) {
              this.context.logger.logError(
                '获取加群人QQ号失败 Uid:',
                notify.user1.uid,
                e
              );
            }
          } else if (
            notify.type === GroupNotifyMsgType.INVITED_BY_MEMBER &&
            notify.status === GroupNotifyMsgStatus.KUNHANDLE
          ) {
            this.context.logger.logDebug(`收到邀请我加群通知:${notify}`);
            const groupInviteEvent = new OB11GroupRequestEvent(
              this.core,
              +notify.group.groupCode,
              +await this.core.apis.UserApi.getUinByUidV2(notify.user2.uid),
              'invite',
              notify.postscript,
              flag
            );
            this.networkManager
              .emitEvent(groupInviteEvent)
              .catch((e) =>
                this.context.logger.logError('处理邀请本人加群失败', e)
              );
          } else if (
            notify.type === GroupNotifyMsgType.INVITED_NEED_ADMINI_STRATOR_PASS &&
            notify.status === GroupNotifyMsgStatus.KUNHANDLE
          ) {
            this.context.logger.logDebug(`收到群员邀请加群通知:${notify}`);
            const groupInviteEvent = new OB11GroupRequestEvent(
              this.core,
              +notify.group.groupCode,
              +await this.core.apis.UserApi.getUinByUidV2(notify.user1.uid),
              'add',
              notify.postscript,
              flag
            );
            this.networkManager
              .emitEvent(groupInviteEvent)
              .catch((e) =>
                this.context.logger.logError('处理邀请本人加群失败', e)
              );
          }
        }
      }
    };
    this.context.session
      .getGroupService()
      .addKernelGroupListener(proxiedListenerOf(groupListener, this.context.logger));
  }

  private async emitMsg (message: RawMessage) {
    this.context.logger.logDebug('收到新消息 RawMessage', message);
    await Promise.allSettled([
      this.handleMsg(message),
      message.chatType === ChatType.KCHATTYPEGROUP ? this.handleGroupEvent(message) : this.handlePrivateMsgEvent(message),
    ]);
  }

  private async handleMsg (message: RawMessage) {
    // 过滤无效消息
    if (message.msgType === NTMsgType.KMSGTYPENULL) {
      return;
    }
    try {
      const ob11Msg = await this.apis.MsgApi.parseMessageV2(message, this.configLoader.configData.parseMultMsg);
      if (ob11Msg) {
        const isSelfMsg = this.isSelfMessage(ob11Msg);
        this.context.logger.logDebug('转化为 OB11Message', ob11Msg);
        if (isSelfMsg || message.chatType !== ChatType.KCHATTYPEGROUP) {
          const targetId = parseInt(message.peerUin);
          ob11Msg.stringMsg.target_id = targetId;
          ob11Msg.arrayMsg.target_id = targetId;
        }

        const msgMap = new Map<string, OB11Message>();

        for (const adapter of this.networkManager.adapters.values()) {
          if (!adapter.isActive) continue;
          const config = adapter.config;
          if (isSelfMsg) {
            if (!('reportSelfMessage' in config) || !config.reportSelfMessage) {
              continue;
            }
          }
          const msgData = config.messagePostFormat === 'string' ? ob11Msg.stringMsg : ob11Msg.arrayMsg;
          if (config.debug) {
            const clone = structuredClone(msgData);
            clone.raw = message;
            msgMap.set(adapter.name, clone);
          } else {
            msgMap.set(adapter.name, msgData);
          }
        }
        if (msgMap.size > 0) {
          this.networkManager.emitEventByNames(msgMap);
        } else if (this.networkManager.hasActiveAdapters()) {
          this.context.logger.logDebug('没有可用的网络适配器发送消息，消息内容:', message);
        }
      }
    } catch (e) {
      this.context.logger.logError('constructMessage error: ', e);
    }
  }

  private isSelfMessage (ob11Msg: {
    stringMsg: OB11Message;
    arrayMsg: OB11Message;
  }): boolean {
    return ob11Msg.stringMsg.user_id.toString() === this.core.selfInfo.uin ||
      ob11Msg.arrayMsg.user_id.toString() === this.core.selfInfo.uin;
  }

  private async handleGroupEvent (message: RawMessage) {
    try {
      // 群名片修改事件解析 任何都该判断
      if (message.senderUin && message.senderUin !== '0') {
        const cardChangedEvent = await this.apis.GroupApi.parseCardChangedEvent(message);
        if (cardChangedEvent) {
          await this.networkManager.emitEvent(cardChangedEvent);
        }
      }
      if (message.msgType === NTMsgType.KMSGTYPEFILE) {
        // 文件为单元素消息
        const elementWrapper = message.elements.find(e => !!e.fileElement);
        if (elementWrapper?.fileElement) {
          const uploadGroupFileEvent = await this.apis.GroupApi.parseGroupUploadFileEvene(message, elementWrapper.fileElement, elementWrapper);
          if (uploadGroupFileEvent) {
            await this.networkManager.emitEvent(uploadGroupFileEvent);
          }
        }
      } else if (message.msgType === NTMsgType.KMSGTYPEGRAYTIPS) {
        // 灰条为单元素消息
        const grayTipElement = message.elements[0]?.grayTipElement;
        if (grayTipElement) {
          const event = await this.apis.GroupApi.parseGrayTipElement(message, grayTipElement);
          if (event) {
            await this.networkManager.emitEvent(event);
          }
        }
      }
    } catch (e) {
      this.context.logger.logError('constructGroupEvent error: ', e);
    }
  }

  private async handlePrivateMsgEvent (message: RawMessage) {
    try {
      if (message.msgType === NTMsgType.KMSGTYPEGRAYTIPS) {
        // 灰条为单元素消息
        const grayTipElement = message.elements[0]?.grayTipElement;
        if (grayTipElement) {
          const event = await this.apis.MsgApi.parsePrivateMsgEvent(message, grayTipElement);
          if (event) {
            await this.networkManager.emitEvent(event);
          }
        }
      }
    } catch (e) {
      this.context.logger.logError('constructPrivateEvent error: ', e);
    }
  }

  private async emitRecallMsg (message: RawMessage, element: MessageElement) {
    const peer: Peer = { chatType: message.chatType, peerUid: message.peerUid, guildId: '' };
    const oriMessageId = MessageUnique.getShortIdByMsgId(message.msgId) ?? MessageUnique.createUniqueMsgId(peer, message.msgId);
    if (message.chatType === ChatType.KCHATTYPEC2C) {
      return await this.emitFriendRecallMsg(message, oriMessageId, element);
    } else if (message.chatType === ChatType.KCHATTYPEGROUP) {
      return await this.emitGroupRecallMsg(message, oriMessageId, element);
    }
    return undefined;
  }

  private async emitFriendRecallMsg (message: RawMessage, oriMessageId: number, element: MessageElement) {
    const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
    if (!operatorUid) return undefined;
    return new OB11FriendRecallNoticeEvent(
      this.core,
      +message.senderUin,
      oriMessageId
    );
  }

  private async emitGroupRecallMsg (message: RawMessage, oriMessageId: number, element: MessageElement) {
    const operatorUid = element.grayTipElement?.revokeElement.operatorUid;
    if (!operatorUid) return undefined;
    const operatorId = await this.core.apis.UserApi.getUinByUidV2(operatorUid);
    return new OB11GroupRecallNoticeEvent(
      this.core,
      +message.peerUin,
      +message.senderUin,
      +operatorId,
      oriMessageId
    );
  }
}

export * from './types/index';
export * from './api/index';
export * from './event/index';
export * from './config/index';
