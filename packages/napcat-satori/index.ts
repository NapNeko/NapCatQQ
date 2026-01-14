import {
  ChatType,
  InstanceContext,
  NapCatCore,
  NodeIKernelBuddyListener,
  NodeIKernelGroupListener,
  NodeIKernelMsgListener,
  RawMessage,
  SendStatusType,
  NTMsgType,
  BuddyReqType,
  GroupNotifyMsgStatus,
  GroupNotifyMsgType,
} from 'napcat-core';
import { SatoriConfigLoader, SatoriConfig, SatoriConfigSchema, SatoriNetworkAdapterConfig } from './config';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import { createSatoriApis, SatoriApiList } from './api';
import { createSatoriActionMap, SatoriActionMap } from './action';
import {
  SatoriNetworkManager,
  SatoriWebSocketServerAdapter,
  SatoriHttpServerAdapter,
  SatoriWebHookClientAdapter,
  SatoriNetworkReloadType,
  ISatoriNetworkAdapter,
} from './network';
import { SatoriLoginStatus } from './types';
// import { MessageUnique } from 'napcat-common/src/message-unique';
import { proxiedListenerOf } from '@/napcat-core/helper/proxy-handler';
import { WebUiDataRuntime } from 'napcat-webui-backend/src/helper/Data';

export class NapCatSatoriAdapter {
  readonly core: NapCatCore;
  readonly context: InstanceContext;

  configLoader: SatoriConfigLoader;
  public apis: SatoriApiList;
  networkManager: SatoriNetworkManager;
  actions: SatoriActionMap;
  private readonly bootTime = Date.now() / 1000;

  constructor (core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
    this.core = core;
    this.context = context;
    this.configLoader = new SatoriConfigLoader(core, pathWrapper.configPath, SatoriConfigSchema);
    this.apis = createSatoriApis(this, core);
    this.actions = createSatoriActionMap(this, core);
    this.networkManager = new SatoriNetworkManager();
  }

  async createSatoriLog (config: SatoriConfig): Promise<string> {
    let log = '[network] 配置加载\n';
    for (const key of config.network.websocketServers) {
      log += `WebSocket服务: ${key.host}:${key.port}${key.path}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    for (const key of config.network.httpServers) {
      log += `HTTP服务: ${key.host}:${key.port}${key.path}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    for (const key of config.network.webhookClients) {
      log += `WebHook上报: ${key.url}, : ${key.enable ? '已启动' : '未启动'}\n`;
    }
    return log;
  }

  async InitSatori (): Promise<void> {
    const config = this.configLoader.configData;
    const serviceInfo = await this.createSatoriLog(config);
    this.context.logger.log(`[Notice] [Satori] ${serviceInfo}`);

    // 注册网络适配器
    for (const wsConfig of config.network.websocketServers) {
      if (wsConfig.enable) {
        this.networkManager.registerAdapter(
          new SatoriWebSocketServerAdapter(wsConfig.name, wsConfig, this.core, this, this.actions)
        );
      }
    }

    for (const httpConfig of config.network.httpServers) {
      if (httpConfig.enable) {
        this.networkManager.registerAdapter(
          new SatoriHttpServerAdapter(httpConfig.name, httpConfig, this.core, this, this.actions)
        );
      }
    }

    for (const webhookConfig of config.network.webhookClients) {
      if (webhookConfig.enable) {
        this.networkManager.registerAdapter(
          new SatoriWebHookClientAdapter(webhookConfig.name, webhookConfig, this.core, this, this.actions)
        );
      }
    }

    await this.networkManager.openAllAdapters();

    // 初始化监听器
    this.initMsgListener();
    this.initBuddyListener();
    this.initGroupListener();

    // 发送登录成功事件
    const loginEvent = this.apis.EventApi.createLoginUpdatedEvent(SatoriLoginStatus.ONLINE);
    await this.networkManager.emitEvent(loginEvent);

    // 注册 Satori 配置热重载回调
    WebUiDataRuntime.setOnSatoriConfigChanged(async (newConfig) => {
      const prev = this.configLoader.configData;
      this.configLoader.save(newConfig);
      await this.reloadNetwork(prev, newConfig);
    });
  }

  async reloadNetwork (prev: SatoriConfig, now: SatoriConfig): Promise<void> {
    const prevLog = await this.createSatoriLog(prev);
    const newLog = await this.createSatoriLog(now);
    this.context.logger.log(`[Notice] [Satori] 配置变更前:\n${prevLog}`);
    this.context.logger.log(`[Notice] [Satori] 配置变更后:\n${newLog}`);

    await this.handleConfigChange(prev.network.websocketServers, now.network.websocketServers, SatoriWebSocketServerAdapter);
    await this.handleConfigChange(prev.network.httpServers, now.network.httpServers, SatoriHttpServerAdapter);
    await this.handleConfigChange(prev.network.webhookClients, now.network.webhookClients, SatoriWebHookClientAdapter);
  }

  private async handleConfigChange<CT extends SatoriNetworkAdapterConfig> (
    prevConfig: SatoriNetworkAdapterConfig[],
    nowConfig: SatoriNetworkAdapterConfig[],
    adapterClass: new (
      ...args: ConstructorParameters<typeof ISatoriNetworkAdapter<CT>>
    ) => ISatoriNetworkAdapter<CT>
  ): Promise<void> {
    // 比较旧的在新的找不到的回收
    for (const adapterConfig of prevConfig) {
      const existingAdapter = nowConfig.find((e) => e.name === adapterConfig.name);
      if (!existingAdapter) {
        const adapter = this.networkManager.findSomeAdapter(adapterConfig.name);
        if (adapter) {
          await this.networkManager.closeSomeAdaterWhenOpen([adapter]);
        }
      }
    }

    // 通知新配置重载
    for (const adapterConfig of nowConfig) {
      const existingAdapter = this.networkManager.findSomeAdapter(adapterConfig.name);
      if (existingAdapter) {
        const networkChange = await existingAdapter.reload(adapterConfig);
        if (networkChange === SatoriNetworkReloadType.NetWorkClose) {
          await this.networkManager.closeSomeAdaterWhenOpen([existingAdapter]);
        }
      } else if (adapterConfig.enable) {
        const newAdapter = new adapterClass(adapterConfig.name, adapterConfig as CT, this.core, this, this.actions);
        await this.networkManager.registerAdapterAndOpen(newAdapter);
      }
    }
  }

  private initMsgListener (): void {
    const msgListener = new NodeIKernelMsgListener();

    msgListener.onRecvMsg = async (msgs) => {
      if (!this.networkManager.hasActiveAdapters()) return;


      for (const msg of msgs) {
        if (this.bootTime > parseInt(msg.msgTime)) {
          continue;
        }
        // this.context.logger.log(`[Satori] Debug: Processing message ${msg.msgId}`);
        await this.handleMessage(msg);
      }
    };

    msgListener.onAddSendMsg = async (msg) => {
      try {
        if (msg.sendStatus === SendStatusType.KSEND_STATUS_SENDING) {
          const [updatemsgs] = await this.core.eventWrapper.registerListen(
            'NodeIKernelMsgListener/onMsgInfoListUpdate',
            (msgList: RawMessage[]) => {
              const report = msgList.find(
                (e) =>
                  e.senderUin === this.core.selfInfo.uin &&
                  e.sendStatus !== SendStatusType.KSEND_STATUS_SENDING &&
                  e.msgId === msg.msgId
              );
              return !!report;
            },
            1,
            10 * 60 * 1000
          );
          const updatemsg = updatemsgs.find((e) => e.msgId === msg.msgId);
          if (updatemsg?.sendStatus === SendStatusType.KSEND_STATUS_SUCCESS) {
            await this.handleMessage(updatemsg);
          }
        }
      } catch (error) {
        this.context.logger.logError('[Satori] 处理发送消息失败', error);
      }
    };

    msgListener.onMsgRecall = async (chatType: ChatType, uid: string, msgSeq: string) => {
      try {
        const peer = { chatType, peerUid: uid, guildId: '' };
        const msgs = await this.core.apis.MsgApi.queryMsgsWithFilterExWithSeq(peer, msgSeq);
        const msg = msgs.msgList.find((e) => e.msgType === NTMsgType.KMSGTYPEGRAYTIPS);

        if (msg) {
          const channelId = chatType === ChatType.KCHATTYPEC2C
            ? `private:${msg.senderUin}`
            : `group:${msg.peerUin}`;
          const event = this.apis.EventApi.createMessageDeletedEvent(
            channelId,
            msg.msgId,
            msg.senderUin
          );
          await this.networkManager.emitEvent(event);
        }
      } catch (error) {
        this.context.logger.logError('[Satori] 处理消息撤回失败', error);
      }
    };

    this.context.session.getMsgService().addKernelMsgListener(
      proxiedListenerOf(msgListener, this.context.logger)
    );
  }

  private initBuddyListener (): void {
    const buddyListener = new NodeIKernelBuddyListener();

    buddyListener.onBuddyReqChange = async (reqs) => {
      this.core.apis.FriendApi.clearBuddyReqUnreadCnt();

      for (let i = 0; i < reqs.unreadNums; i++) {
        const req = reqs.buddyReqs[i];
        if (!req) continue;
        if (
          !!req.isInitiator ||
          (req.isDecide && req.reqType !== BuddyReqType.KMEINITIATORWAITPEERCONFIRM) ||
          !req.isUnread
        ) {
          continue;
        }

        try {
          const event = this.apis.EventApi.createFriendRequestEvent(req);
          await this.networkManager.emitEvent(event);
        } catch (error) {
          this.context.logger.logError('[Satori] 处理好友请求失败', error);
        }
      }
    };

    this.context.session.getBuddyService().addKernelBuddyListener(
      proxiedListenerOf(buddyListener, this.context.logger)
    );
  }

  private initGroupListener (): void {
    const groupListener = new NodeIKernelGroupListener();

    groupListener.onGroupNotifiesUpdated = async (_, notifies) => {
      await this.core.apis.GroupApi.clearGroupNotifiesUnreadCount(false);
      if (!notifies[0]?.type) return;

      for (const notify of notifies) {
        const notifyTime = parseInt(notify.seq) / 1000 / 1000;
        if (notifyTime < this.bootTime) continue;

        try {
          if (
            [GroupNotifyMsgType.REQUEST_JOIN_NEED_ADMINI_STRATOR_PASS].includes(notify.type) &&
            notify.status === GroupNotifyMsgStatus.KUNHANDLE
          ) {
            const event = this.apis.EventApi.createGuildMemberRequestEvent(notify);
            await this.networkManager.emitEvent(event);
          }
        } catch (error) {
          this.context.logger.logError('[Satori] 处理群通知失败', error);
        }
      }
    };

    this.context.session.getGroupService().addKernelGroupListener(
      proxiedListenerOf(groupListener, this.context.logger)
    );
  }

  private async handleMessage (message: RawMessage): Promise<void> {
    if (message.msgType === NTMsgType.KMSGTYPENULL) return;

    try {
      const event = await this.apis.EventApi.createMessageEvent(message);
      if (event) {
        this.context.logger.logDebug(`[Satori] Emitting event ${event.type}`);
        await this.networkManager.emitEvent(event);
      } else {
        this.context.logger.logDebug(`[Satori] Event creation returned null for msg ${message.msgId}`);
      }
    } catch (error) {
      this.context.logger.logError('[Satori] 处理消息失败', error);
    }
  }
}

export * from './types';
export * from './config';
export * from './action';
export * from './helper';
