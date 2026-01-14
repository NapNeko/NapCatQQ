import { InstanceContext, NapCatCore } from 'napcat-core';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import { IProtocolAdapter, IProtocolAdapterFactory, ProtocolInfo } from './types';
import { OneBotProtocolAdapterFactory, OneBotProtocolAdapter } from './adapters/onebot';
import { SatoriProtocolAdapterFactory, SatoriProtocolAdapter } from './adapters/satori';

/**
 * 协议管理器 - 统一管理所有协议适配器
 */
export class ProtocolManager {
  private factories: Map<string, IProtocolAdapterFactory> = new Map();
  private adapters: Map<string, IProtocolAdapter> = new Map();
  private initialized: boolean = false;

  constructor (
    private core: NapCatCore,
    private context: InstanceContext,
    private pathWrapper: NapCatPathWrapper
  ) {
    // 注册内置协议工厂
    this.registerFactory(new OneBotProtocolAdapterFactory());
    this.registerFactory(new SatoriProtocolAdapterFactory());
  }

  /**
   * 注册协议适配器工厂
   */
  registerFactory (factory: IProtocolAdapterFactory): void {
    if (this.factories.has(factory.protocolId)) {
      this.context.logger.logWarn(`[Protocol] 协议工厂 ${factory.protocolId} 已存在，将被覆盖`);
    }
    this.factories.set(factory.protocolId, factory);
    this.context.logger.log(`[Protocol] 注册协议工厂: ${factory.protocolName} (${factory.protocolId})`);
  }

  /**
   * 获取所有已注册的协议信息
   */
  getRegisteredProtocols (): ProtocolInfo[] {
    const protocols: ProtocolInfo[] = [];
    for (const [id, factory] of this.factories) {
      protocols.push({
        id,
        name: factory.protocolName,
        version: factory.protocolVersion,
        description: factory.protocolDescription,
        enabled: this.adapters.has(id),
      });
    }
    return protocols;
  }

  /**
   * 初始化指定协议
   */
  async initProtocol (protocolId: string): Promise<IProtocolAdapter | null> {
    const factory = this.factories.get(protocolId);
    if (!factory) {
      this.context.logger.logError(`[Protocol] 未找到协议工厂: ${protocolId}`);
      return null;
    }

    if (this.adapters.has(protocolId)) {
      this.context.logger.logWarn(`[Protocol] 协议 ${protocolId} 已初始化`);
      return this.adapters.get(protocolId)!;
    }

    try {
      const adapter = factory.create(this.core, this.context, this.pathWrapper);
      await adapter.init();
      this.adapters.set(protocolId, adapter);
      this.context.logger.log(`[Protocol] 协议 ${adapter.name} 初始化成功`);
      return adapter;
    } catch (error) {
      this.context.logger.logError(`[Protocol] 协议 ${protocolId} 初始化失败:`, error);
      return null;
    }
  }

  /**
   * 初始化所有协议
   */
  async initAllProtocols (): Promise<void> {
    if (this.initialized) {
      this.context.logger.logWarn('[Protocol] 协议管理器已初始化');
      return;
    }

    this.context.logger.log('[Protocol] 开始初始化所有协议...');

    for (const [protocolId] of this.factories) {
      await this.initProtocol(protocolId);
    }

    this.initialized = true;
    this.context.logger.log('[Protocol] 所有协议初始化完成');
  }

  /**
   * 销毁指定协议
   */
  async destroyProtocol (protocolId: string): Promise<void> {
    const adapter = this.adapters.get(protocolId);
    if (!adapter) {
      this.context.logger.logWarn(`[Protocol] 协议 ${protocolId} 未初始化`);
      return;
    }

    try {
      await adapter.destroy();
      this.adapters.delete(protocolId);
      this.context.logger.log(`[Protocol] 协议 ${adapter.name} 已销毁`);
    } catch (error) {
      this.context.logger.logError(`[Protocol] 协议 ${protocolId} 销毁失败:`, error);
    }
  }

  /**
   * 销毁所有协议
   */
  async destroyAllProtocols (): Promise<void> {
    this.context.logger.log('[Protocol] 开始销毁所有协议...');

    for (const [protocolId] of this.adapters) {
      await this.destroyProtocol(protocolId);
    }

    this.initialized = false;
    this.context.logger.log('[Protocol] 所有协议已销毁');
  }

  /**
   * 获取协议适配器
   */
  getAdapter<T extends IProtocolAdapter = IProtocolAdapter> (protocolId: string): T | null {
    return (this.adapters.get(protocolId) as T) ?? null;
  }

  /**
   * 获取 OneBot 协议适配器
   */
  getOneBotAdapter (): OneBotProtocolAdapter | null {
    return this.getAdapter<OneBotProtocolAdapter>('onebot11');
  }

  /**
   * 获取 Satori 协议适配器
   */
  getSatoriAdapter (): SatoriProtocolAdapter | null {
    return this.getAdapter<SatoriProtocolAdapter>('satori');
  }

  /**
   * 重载协议配置
   */
  async reloadProtocolConfig (protocolId: string, prevConfig: unknown, newConfig: unknown): Promise<void> {
    const adapter = this.adapters.get(protocolId);
    if (!adapter) {
      this.context.logger.logWarn(`[Protocol] 协议 ${protocolId} 未初始化，无法重载配置`);
      return;
    }

    try {
      await adapter.reloadConfig(prevConfig, newConfig);
      this.context.logger.log(`[Protocol] 协议 ${adapter.name} 配置已重载`);
    } catch (error) {
      this.context.logger.logError(`[Protocol] 协议 ${protocolId} 配置重载失败:`, error);
    }
  }

  /**
   * 检查协议是否已初始化
   */
  isProtocolInitialized (protocolId: string): boolean {
    return this.adapters.has(protocolId);
  }

  /**
   * 获取所有已初始化的协议ID
   */
  getInitializedProtocolIds (): string[] {
    return Array.from(this.adapters.keys());
  }
}
