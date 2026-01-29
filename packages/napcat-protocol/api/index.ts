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
  constructor (adapter: NapCatProtocolAdapter, core: NapCatCore) {
    super(adapter, core);
  }

  // 消息相关 API 方法可以在这里实现
}

// 用户 API
export class NapCatProtocolUserApi extends NapCatProtocolApiBase {
  constructor (adapter: NapCatProtocolAdapter, core: NapCatCore) {
    super(adapter, core);
  }

  // 用户相关 API 方法可以在这里实现
}

// 群组 API
export class NapCatProtocolGroupApi extends NapCatProtocolApiBase {
  constructor (adapter: NapCatProtocolAdapter, core: NapCatCore) {
    super(adapter, core);
  }

  // 群组相关 API 方法可以在这里实现
}

// 好友 API
export class NapCatProtocolFriendApi extends NapCatProtocolApiBase {
  constructor (adapter: NapCatProtocolAdapter, core: NapCatCore) {
    super(adapter, core);
  }

  // 好友相关 API 方法可以在这里实现
}
