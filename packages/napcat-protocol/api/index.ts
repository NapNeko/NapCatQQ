import { NapCatCore } from 'napcat-core';
import { NapCatProtocolAdapter } from '@/napcat-protocol/index';

// NapCat Protocol API 基类
export abstract class NapCatProtocolApiBase {
  protected adapter: NapCatProtocolAdapter;
  protected core: NapCatCore;

  constructor (adapter: NapCatProtocolAdapter, core: NapCatCore) {
    this.adapter = adapter;
    this.core = core;
  }
}

// 消息 API
export class NapCatProtocolMsgApi extends NapCatProtocolApiBase {

  // 消息相关 API 方法可以在这里实现
}

// 用户 API
export class NapCatProtocolUserApi extends NapCatProtocolApiBase {

  // 用户相关 API 方法可以在这里实现
}

// 群组 API
export class NapCatProtocolGroupApi extends NapCatProtocolApiBase {

  // 群组相关 API 方法可以在这里实现
}

// 好友 API
export class NapCatProtocolFriendApi extends NapCatProtocolApiBase {

  // 好友相关 API 方法可以在这里实现
}
