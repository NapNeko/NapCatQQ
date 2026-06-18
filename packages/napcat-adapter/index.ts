import { InstanceContext, NapCatCore } from 'napcat-core';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import { NapCatOneBot11Adapter } from 'napcat-onebot';
import { NapCatProtocolAdapter } from 'napcat-protocol';

// 协议适配器类型
export type ProtocolAdapterType = 'onebot11' | 'napcat-protocol';

// 协议适配器接口
export interface IProtocolAdapter {
  readonly name: string;
  readonly enabled: boolean;
  init (): Promise<void>;
  close (): Promise<void>;
}

// 协议适配器包装器
class OneBotAdapterWrapper implements IProtocolAdapter {
  readonly name = 'onebot11';
  private adapter: NapCatOneBot11Adapter;

  constructor (adapter: NapCatOneBot11Adapter) {
    this.adapter = adapter;
  }

  get enabled (): boolean {
    return true; // OneBot11 默认启用
  }

  async init (): Promise<void> {
    await this.adapter.InitOneBot();
  }

  async close (): Promise<void> {
    await this.adapter.networkManager.closeAllAdapters();
  }

  getAdapter (): NapCatOneBot11Adapter {
    return this.adapter;
  }
}

// NapCat Protocol 适配器包装器
class NapCatProtocolAdapterWrapper implements IProtocolAdapter {
  readonly name = 'napcat-protocol';
  private adapter: NapCatProtocolAdapter;

  constructor (adapter: NapCatProtocolAdapter) {
    this.adapter = adapter;
  }

  get enabled (): boolean {
    return this.adapter.isEnabled();
  }

  async init (): Promise<void> {
    await this.adapter.initProtocol();
  }

  async close (): Promise<void> {
    await this.adapter.close();
  }

  getAdapter (): NapCatProtocolAdapter {
    return this.adapter;
  }
}

// 协议适配器管理器
export class NapCatAdapterManager {
  private core: NapCatCore;
  private context: InstanceContext;
  private pathWrapper: NapCatPathWrapper;

  // 协议适配器实例
  private onebotAdapter: OneBotAdapterWrapper | null = null;
  private napcatProtocolAdapter: NapCatProtocolAdapterWrapper | null = null;

  // 所有已注册的适配器
  private adapters: Map<string, IProtocolAdapter> = new Map();

  constructor (core: NapCatCore, context: InstanceContext, pathWrapper: NapCatPathWrapper) {
    this.core = core;
    this.context = context;
    this.pathWrapper = pathWrapper;
  }

  // 初始化所有协议适配器
  async initAdapters (): Promise<void> {
    this.context.logger.log('[AdapterManager] 开始初始化协议适配器...');

    // 初始化 OneBot11 适配器 (默认启用)
    try {
      const onebot = new NapCatOneBot11Adapter(this.core, this.context, this.pathWrapper);
      this.onebotAdapter = new OneBotAdapterWrapper(onebot);
      this.adapters.set('onebot11', this.onebotAdapter);
      await this.onebotAdapter.init();
      this.context.logger.log('[AdapterManager] OneBot11 适配器初始化完成');
    } catch (e) {
      this.context.logger.logError('[AdapterManager] OneBot11 适配器初始化失败:', e);
    }

    // 初始化 NapCat Protocol 适配器 (默认关闭，需要配置启用)
    try {
      const napcatProtocol = new NapCatProtocolAdapter(this.core, this.context, this.pathWrapper);
      this.napcatProtocolAdapter = new NapCatProtocolAdapterWrapper(napcatProtocol);
      this.adapters.set('napcat-protocol', this.napcatProtocolAdapter);

      if (this.napcatProtocolAdapter.enabled) {
        await this.napcatProtocolAdapter.init();
        this.context.logger.log('[AdapterManager] NapCat Protocol 适配器初始化完成');
      } else {
        this.context.logger.log('[AdapterManager] NapCat Protocol 适配器未启用，跳过初始化');
      }
    } catch (e) {
      this.context.logger.logError('[AdapterManager] NapCat Protocol 适配器初始化失败:', e);
    }

    this.context.logger.log(`[AdapterManager] 协议适配器初始化完成，已加载 ${this.adapters.size} 个适配器`);
  }

  // 获取 OneBot11 适配器
  getOneBotAdapter (): NapCatOneBot11Adapter | null {
    return this.onebotAdapter?.getAdapter() ?? null;
  }

  // 获取 NapCat Protocol 适配器
  getNapCatProtocolAdapter (): NapCatProtocolAdapter | null {
    return this.napcatProtocolAdapter?.getAdapter() ?? null;
  }

  // 获取指定适配器
  getAdapter (name: ProtocolAdapterType): IProtocolAdapter | undefined {
    return this.adapters.get(name);
  }

  // 获取所有已启用的适配器
  getEnabledAdapters (): IProtocolAdapter[] {
    return Array.from(this.adapters.values()).filter(adapter => adapter.enabled);
  }

  // 获取所有适配器
  getAllAdapters (): IProtocolAdapter[] {
    return Array.from(this.adapters.values());
  }

  // 关闭所有适配器
  async closeAllAdapters (): Promise<void> {
    this.context.logger.log('[AdapterManager] 开始关闭所有协议适配器...');

    for (const [name, adapter] of this.adapters) {
      try {
        await adapter.close();
        this.context.logger.log(`[AdapterManager] ${name} 适配器已关闭`);
      } catch (e) {
        this.context.logger.logError(`[AdapterManager] 关闭 ${name} 适配器失败:`, e);
      }
    }

    this.adapters.clear();
    this.context.logger.log('[AdapterManager] 所有协议适配器已关闭');
  }

  // 重新加载指定适配器
  async reloadAdapter (name: ProtocolAdapterType): Promise<void> {
    const adapter = this.adapters.get(name);
    if (adapter) {
      await adapter.close();
      await adapter.init();
      this.context.logger.log(`[AdapterManager] ${name} 适配器已重新加载`);
    }
  }
}

export { NapCatOneBot11Adapter } from 'napcat-onebot';
export { NapCatProtocolAdapter } from 'napcat-protocol';
