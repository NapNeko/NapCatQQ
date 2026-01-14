import { InstanceContext, NapCatCore } from 'napcat-core';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import { NapCatOneBot11Adapter } from 'napcat-onebot/index';
import { OB11ConfigLoader } from 'napcat-onebot/config';
import { IProtocolAdapter, IProtocolAdapterFactory } from '../types';

/**
 * OneBot11 协议适配器包装器
 */
export class OneBotProtocolAdapter implements IProtocolAdapter {
  readonly name = 'OneBot11';
  readonly id = 'onebot11';
  readonly version = '11';
  readonly description = 'OneBot v11 协议适配器';

  private adapter: NapCatOneBot11Adapter;

  constructor (
    _core: NapCatCore,
    _context: InstanceContext,
    _pathWrapper: NapCatPathWrapper
  ) {
    this.adapter = new NapCatOneBot11Adapter(_core, _context, _pathWrapper);
  }

  async init (): Promise<void> {
    await this.adapter.InitOneBot();
  }

  async destroy (): Promise<void> {
    await this.adapter.networkManager.closeAllAdapters();
  }

  async reloadConfig (_prevConfig: unknown, newConfig: unknown): Promise<void> {
    const now = newConfig as Parameters<typeof this.adapter.configLoader.save>[0];
    this.adapter.configLoader.save(now);
    // 内部会处理网络重载
  }

  /** 获取原始适配器实例 */
  getRawAdapter (): NapCatOneBot11Adapter {
    return this.adapter;
  }

  /** 获取配置加载器 */
  getConfigLoader (): OB11ConfigLoader {
    return this.adapter.configLoader;
  }
}

/**
 * OneBot11 协议适配器工厂
 */
export class OneBotProtocolAdapterFactory implements IProtocolAdapterFactory<OneBotProtocolAdapter> {
  readonly protocolId = 'onebot11';
  readonly protocolName = 'OneBot11';
  readonly protocolVersion = '11';
  readonly protocolDescription = 'OneBot v11 协议适配器，支持 HTTP、WebSocket 等多种网络方式';

  create (
    core: NapCatCore,
    context: InstanceContext,
    pathWrapper: NapCatPathWrapper
  ): OneBotProtocolAdapter {
    return new OneBotProtocolAdapter(core, context, pathWrapper);
  }
}
