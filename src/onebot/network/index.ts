import { OneBotEvent } from '@/onebot/event/OneBotEvent';
import { OB11Message } from '@/onebot';
import { NetworkAdapterConfig } from '@/onebot/config/config';
import { IOB11NetworkAdapter } from '@/onebot/network/adapter';

export type OB11EmitEventContent = OneBotEvent | OB11Message;
export enum OB11NetworkReloadType {
    Normal = 0,
    ConfigChange = 1,
    NetWorkReload = 2,
    NetWorkClose = 3,
    NetWorkOpen = 4
}

export class OB11NetworkManager {
    adapters: Map<string, IOB11NetworkAdapter<NetworkAdapterConfig>> = new Map();

    async openAllAdapters() {
        return Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.open()));
    }

    async emitEvent(event: OB11EmitEventContent) {
        return Promise.all(Array.from(this.adapters.values()).map(adapter => {
            if (adapter.isEnable) {
                return adapter.onEvent(event);
            }
        }));
    }

    async emitEvents(events: OB11EmitEventContent[]) {
        return Promise.all(events.map(event => this.emitEvent(event)));
    }

    async emitEventByName(names: string[], event: OB11EmitEventContent) {
        return Promise.all(names.map(name => {
            const adapter = this.adapters.get(name);
            if (adapter && adapter.isEnable) {
                return adapter.onEvent(event);
            }
        }));
    }

    async emitEventByNames(map: Map<string, OB11EmitEventContent>) {
        return Promise.all(Array.from(map.entries()).map(([name, event]) => {
            const adapter = this.adapters.get(name);
            if (adapter && adapter.isEnable) {
                return adapter.onEvent(event);
            }
        }));
    }

    registerAdapter<CT extends NetworkAdapterConfig>(adapter: IOB11NetworkAdapter<CT>) {
        this.adapters.set(adapter.name, adapter);
    }

    async registerAdapterAndOpen<CT extends NetworkAdapterConfig>(adapter: IOB11NetworkAdapter<CT>) {
        this.registerAdapter(adapter);
        await adapter.open();
    }

    async closeSomeAdapters<CT extends NetworkAdapterConfig>(adaptersToClose: IOB11NetworkAdapter<CT>[]) {
        for (const adapter of adaptersToClose) {
            this.adapters.delete(adapter.name);
            await adapter.close();
        }
    }
    async closeSomeAdaterWhenOpen<CT extends NetworkAdapterConfig>(adaptersToClose: IOB11NetworkAdapter<CT>[]) {
        for (const adapter of adaptersToClose) {
            this.adapters.delete(adapter.name);
            if (adapter.isEnable) {
                await adapter.close();
            }
        }
    }

    findSomeAdapter(name: string) {
        return this.adapters.get(name);
    }

    async closeAdapterByPredicate(closeFilter: (adapter: IOB11NetworkAdapter<NetworkAdapterConfig>) => boolean) {
        const adaptersToClose = Array.from(this.adapters.values()).filter(closeFilter);
        await this.closeSomeAdapters(adaptersToClose);
    }

    async closeAllAdapters() {
        await Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.close()));
        this.adapters.clear();
    }

    async readloadAdapter<T>(name: string, config: T) {
        const adapter = this.adapters.get(name);
        if (adapter) {
            await adapter.reload(config);
        }
    }
    async readloadSomeAdapters<T>(configMap: Map<string, T>) {
        await Promise.all(Array.from(configMap.entries()).map(([name, config]) => this.readloadAdapter(name, config)));
    }
    async getAllConfig() {
        return Array.from(this.adapters.values()).map(adapter => adapter.config);
    }
}

export * from './http-client';
export * from './websocket-client';
export * from './http-server';
export * from './websocket-server';
