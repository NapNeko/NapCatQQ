import { ISatoriNetworkAdapter, SatoriEmitEventContent, SatoriNetworkReloadType } from './adapter';
import { SatoriNetworkAdapterConfig } from '@/napcat-satori/config/config';

export class SatoriNetworkManager {
  adapters: Map<string, ISatoriNetworkAdapter<SatoriNetworkAdapterConfig>> = new Map();

  async registerAdapter<T extends SatoriNetworkAdapterConfig> (
    adapter: ISatoriNetworkAdapter<T>
  ): Promise<void> {
    this.adapters.set(adapter.name, adapter as ISatoriNetworkAdapter<SatoriNetworkAdapterConfig>);
  }

  async registerAdapterAndOpen<T extends SatoriNetworkAdapterConfig> (
    adapter: ISatoriNetworkAdapter<T>
  ): Promise<void> {
    await this.registerAdapter(adapter);
    await adapter.open();
  }

  findSomeAdapter (name: string): ISatoriNetworkAdapter<SatoriNetworkAdapterConfig> | undefined {
    return this.adapters.get(name);
  }

  async openAllAdapters (): Promise<void> {
    const openPromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.open().catch((e) => {
        adapter.logger.logError(`[Satori] 适配器 ${adapter.name} 启动失败: ${e}`);
      })
    );
    await Promise.all(openPromises);
  }

  async closeAllAdapters (): Promise<void> {
    const closePromises = Array.from(this.adapters.values()).map((adapter) =>
      adapter.close().catch((e) => {
        adapter.logger.logError(`[Satori] 适配器 ${adapter.name} 关闭失败: ${e}`);
      })
    );
    await Promise.all(closePromises);
  }

  async closeSomeAdaterWhenOpen (
    adapters: ISatoriNetworkAdapter<SatoriNetworkAdapterConfig>[]
  ): Promise<void> {
    for (const adapter of adapters) {
      if (adapter.isActive) {
        await adapter.close();
      }
      this.adapters.delete(adapter.name);
    }
  }

  async emitEvent<T extends SatoriEmitEventContent> (event: T): Promise<void> {
    const emitPromises = Array.from(this.adapters.values())
      .filter((adapter) => adapter.isActive)
      .map((adapter) =>
        adapter.onEvent(event).catch((e) => {
          adapter.logger.logError(`[Satori] 适配器 ${adapter.name} 事件发送失败: ${e}`);
        })
      );
    await Promise.all(emitPromises);
  }

  hasActiveAdapters (): boolean {
    return Array.from(this.adapters.values()).some((adapter) => adapter.isActive);
  }
}

export { ISatoriNetworkAdapter, SatoriEmitEventContent, SatoriNetworkReloadType } from './adapter';
export { SatoriWebSocketServerAdapter } from './websocket-server';
export { SatoriHttpServerAdapter } from './http-server';
export { SatoriWebHookClientAdapter } from './webhook-client';
