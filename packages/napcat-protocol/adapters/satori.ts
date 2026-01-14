import { InstanceContext, NapCatCore } from 'napcat-core';
import { NapCatPathWrapper } from 'napcat-common/src/path';
import { NapCatSatoriAdapter } from 'napcat-satori/index';
import { SatoriConfig, SatoriConfigLoader } from 'napcat-satori/config';
import { IProtocolAdapter, IProtocolAdapterFactory } from '../types';

/**
 * Satori 协议适配器包装器
 */
export class SatoriProtocolAdapter implements IProtocolAdapter {
  readonly name = 'Satori';
  readonly id = 'satori';
  readonly version = '1';
  readonly description = 'Satori 协议适配器';

  private adapter: NapCatSatoriAdapter;

  constructor (
    private _core: NapCatCore,
    private _context: InstanceContext,
    private _pathWrapper: NapCatPathWrapper
  ) {
    this.adapter = new NapCatSatoriAdapter(_core, _context, _pathWrapper);
  }

  async init (): Promise<void> {
    await this.adapter.InitSatori();
  }

  async destroy (): Promise<void> {
    await this.adapter.networkManager.closeAllAdapters();
  }

  async reloadConfig (prevConfig: unknown, newConfig: unknown): Promise<void> {
    const prev = prevConfig as SatoriConfig;
    const now = newConfig as SatoriConfig;
    this.adapter.configLoader.save(now);
    await this.adapter.reloadNetwork(prev, now);
  }

  /** 获取原始适配器实例 */
  getRawAdapter (): NapCatSatoriAdapter {
    return this.adapter;
  }

  /** 获取配置加载器 */
  getConfigLoader (): SatoriConfigLoader {
    return this.adapter.configLoader;
  }
}

/**
 * Satori 协议适配器工厂
 */
export class SatoriProtocolAdapterFactory implements IProtocolAdapterFactory<SatoriProtocolAdapter> {
  readonly protocolId = 'satori';
  readonly protocolName = 'Satori';
  readonly protocolVersion = '1';
  readonly protocolDescription = 'Satori 协议适配器，支持 WebSocket、HTTP、WebHook 等多种网络方式';

  create (
    core: NapCatCore,
    context: InstanceContext,
    pathWrapper: NapCatPathWrapper
  ): SatoriProtocolAdapter {
    return new SatoriProtocolAdapter(core, context, pathWrapper);
  }
}
