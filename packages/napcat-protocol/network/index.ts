import { NapCatProtocolEvent } from '@/napcat-protocol/event/NapCatProtocolEvent';
import { NapCatProtocolMessage } from '@/napcat-protocol/types';
import { NetworkAdapterConfig } from '@/napcat-protocol/config/config';
import { INapCatProtocolNetworkAdapter } from '@/napcat-protocol/network/adapter';

export type NapCatProtocolEmitEventContent = NapCatProtocolEvent | NapCatProtocolMessage;

export enum NapCatProtocolNetworkReloadType {
  Normal = 0,
  ConfigChange = 1,
  NetWorkReload = 2,
  NetWorkClose = 3,
  NetWorkOpen = 4,
}

export class NapCatProtocolNetworkManager {
  adapters: Map<string, INapCatProtocolNetworkAdapter<NetworkAdapterConfig>> = new Map();

  async openAllAdapters () {
    return Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.open()));
  }

  async emitEvent (event: NapCatProtocolEmitEventContent) {
    return Promise.all(Array.from(this.adapters.values()).map(async adapter => {
      if (adapter.isActive) {
        return await adapter.onEvent(event);
      }
    }));
  }

  async emitEvents (events: NapCatProtocolEmitEventContent[]) {
    return Promise.all(events.map(event => this.emitEvent(event)));
  }

  async emitEventByName (names: string[], event: NapCatProtocolEmitEventContent) {
    return Promise.all(names.map(async name => {
      const adapter = this.adapters.get(name);
      if (adapter && adapter.isActive) {
        return await adapter.onEvent(event);
      }
    }));
  }

  async emitEventByNames (map: Map<string, NapCatProtocolEmitEventContent>) {
    return Promise.all(Array.from(map.entries()).map(async ([name, event]) => {
      const adapter = this.adapters.get(name);
      if (adapter && adapter.isActive) {
        return await adapter.onEvent(event);
      }
    }));
  }

  registerAdapter<CT extends NetworkAdapterConfig> (adapter: INapCatProtocolNetworkAdapter<CT>) {
    this.adapters.set(adapter.name, adapter);
  }

  async registerAdapterAndOpen<CT extends NetworkAdapterConfig> (adapter: INapCatProtocolNetworkAdapter<CT>) {
    this.registerAdapter(adapter);
    await adapter.open();
  }

  async closeSomeAdapters<CT extends NetworkAdapterConfig> (adaptersToClose: INapCatProtocolNetworkAdapter<CT>[]) {
    for (const adapter of adaptersToClose) {
      this.adapters.delete(adapter.name);
      await adapter.close();
    }
  }

  async closeSomeAdapterWhenOpen<CT extends NetworkAdapterConfig> (adaptersToClose: INapCatProtocolNetworkAdapter<CT>[]) {
    for (const adapter of adaptersToClose) {
      this.adapters.delete(adapter.name);
      if (adapter.isEnable) {
        await adapter.close();
      }
    }
  }

  findSomeAdapter (name: string) {
    return this.adapters.get(name);
  }

  async closeAdapterByPredicate (closeFilter: (adapter: INapCatProtocolNetworkAdapter<NetworkAdapterConfig>) => boolean) {
    const adaptersToClose = Array.from(this.adapters.values()).filter(closeFilter);
    await this.closeSomeAdapters(adaptersToClose);
  }

  async closeAllAdapters () {
    await Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.close()));
    this.adapters.clear();
  }

  async reloadAdapter<T> (name: string, config: T) {
    const adapter = this.adapters.get(name);
    if (adapter) {
      await adapter.reload(config);
    }
  }

  async reloadSomeAdapters<T> (configMap: Map<string, T>) {
    await Promise.all(Array.from(configMap.entries()).map(([name, config]) => this.reloadAdapter(name, config)));
  }

  hasActiveAdapters (): boolean {
    return Array.from(this.adapters.values()).some(adapter => adapter.isActive);
  }

  async getAllConfig () {
    return Array.from(this.adapters.values()).map(adapter => adapter.config);
  }
}

export * from './adapter';
