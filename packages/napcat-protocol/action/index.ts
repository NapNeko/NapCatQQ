import { NapCatCore } from 'napcat-core';
import { NapCatProtocolResponse } from '@/napcat-protocol/types';

// 前向声明类型，避免循环依赖
import type { NapCatProtocolAdapter } from '@/napcat-protocol/index';

// Action 基类
export abstract class BaseAction<PayloadType = unknown, ReturnType = unknown> {
  abstract actionName: string;
  protected core: NapCatCore;
  protected adapter: NapCatProtocolAdapter;

  constructor (adapter: NapCatProtocolAdapter, core: NapCatCore) {
    this.adapter = adapter;
    this.core = core;
  }

  protected abstract _handle (payload: PayloadType): Promise<ReturnType>;

  async handle (payload: PayloadType): Promise<NapCatProtocolResponse<ReturnType>> {
    try {
      const result = await this._handle(payload);
      return {
        status: 'ok',
        retcode: 0,
        data: result,
      };
    } catch (e) {
      return {
        status: 'failed',
        retcode: -1,
        data: null,
        message: e instanceof Error ? e.message : String(e),
      };
    }
  }
}

// Action 映射类型
export type ActionMap = Map<string, BaseAction<unknown, unknown>>;

// 创建 Action 映射

export function createActionMap (_adapter: NapCatProtocolAdapter, _core: NapCatCore): ActionMap {
  const actionMap = new Map<string, BaseAction<unknown, unknown>>();

  // 这里可以注册各种 Action
  // 例如: actionMap.set('send_msg', new SendMsgAction(adapter, core));

  return actionMap;
}
