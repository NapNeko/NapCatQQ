import {
  InstanceContext,
  NapCatCore,
} from 'napcat-core';
import { NapCatProtocolConfigLoader, NapCatProtocolConfig } from '@/napcat-protocol/config';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import {
  NapCatProtocolNetworkManager,
} from '@/napcat-protocol/network';
import {
  NapCatProtocolMsgApi,
  NapCatProtocolUserApi,
  NapCatProtocolGroupApi,
  NapCatProtocolFriendApi,
} from '@/napcat-protocol/api';
import { ActionMap, createActionMap } from '@/napcat-protocol/action';

interface ApiListType {
  MsgApi: NapCatProtocolMsgApi;
  UserApi: NapCatProtocolUserApi;
  GroupApi: NapCatProtocolGroupApi;
  FriendApi: NapCatProtocolFriendApi;
}

// NapCat Protocol 适配器 - NapCat 私有 Bot 协议实现
export class NapCatProtocolAdapter {
  readonly core: NapCatCore;
  readonly context: InstanceContext;

  configLoader: NapCatProtocolConfigLoader;
  public apis: ApiListType;
  networkManager: NapCatProtocolNetworkManager;
  actions: ActionMap;

  constructor (core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
    this.core = core;
    this.context = context;
    this.configLoader = new NapCatProtocolConfigLoader(core, pathWrapper.configPath);
    this.apis = {
      MsgApi: new NapCatProtocolMsgApi(this, core),
      UserApi: new NapCatProtocolUserApi(this, core),
      GroupApi: new NapCatProtocolGroupApi(this, core),
      FriendApi: new NapCatProtocolFriendApi(this, core),
    } as const;
    this.actions = createActionMap(this, core);
    this.networkManager = new NapCatProtocolNetworkManager();
  }

  // 检查协议是否启用
  isEnabled (): boolean {
    return this.configLoader.configData.enable;
  }

  async createProtocolLog (config: NapCatProtocolConfig) {
    let log = '[NapCat Protocol] 配置加载\n';
    log += `协议状态: ${config.enable ? '已启用' : '已禁用'}\n`;

    if (config.enable) {
      for (const key of config.network.httpServers) {
        log += `HTTP服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
      }
      for (const key of config.network.websocketServers) {
        log += `WebSocket服务: ${key.host}:${key.port}, : ${key.enable ? '已启动' : '未启动'}\n`;
      }
      for (const key of config.network.websocketClients) {
        log += `WebSocket客户端: ${key.url}, : ${key.enable ? '已启动' : '未启动'}\n`;
      }
    }
    return log;
  }

  async initProtocol () {
    const config = this.configLoader.configData;

    // 如果协议未启用，直接返回
    if (!config.enable) {
      this.context.logger.log('[NapCat Protocol] 协议未启用，跳过初始化');
      return;
    }

    const selfInfo = this.core.selfInfo;
    const serviceInfo = await this.createProtocolLog(config);
    this.context.logger.log(`[Notice] ${serviceInfo}`);

    // 注册网络适配器
    // 这里可以根据配置注册不同的网络适配器
    // 例如: WebSocket Server, WebSocket Client, HTTP Server 等

    await this.networkManager.openAllAdapters();

    this.context.logger.log(`[NapCat Protocol] 初始化完成，Bot: ${selfInfo.uin}`);
  }

  async close () {
    await this.networkManager.closeAllAdapters();
    this.context.logger.log('[NapCat Protocol] 已关闭所有网络适配器');
  }
}

export * from './types/index';
export * from './api/index';
export * from './event/index';
export * from './config/index';
export * from './network/index';
