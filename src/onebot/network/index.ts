import { OneBotEvent } from '@/onebot/event/OneBotEvent';
import { OB11Message } from '@/onebot';
import { ActionMap } from '@/onebot/action';
import { NetworkConfigAdapter } from '@/onebot/config/config';

export type OB11EmitEventContent = OneBotEvent | OB11Message;
export enum OB11NetworkReloadType {
    Normal = 0,
    ConfigChange = 1,
    NetWorkReload = 2,
    NetWorkClose = 3,
    NetWorkOpen = 4
}
export interface IOB11NetworkAdapter {
    actions: ActionMap;
    name: string;
    isEnable: boolean;
    config: NetworkConfigAdapter;

    onEvent<T extends OB11EmitEventContent>(event: T): void;

    open(): void | Promise<void>;

    close(): void | Promise<void>;

    reload(config: any): OB11NetworkReloadType | Promise<OB11NetworkReloadType>;
}

export class OB11NetworkManager {
    adapters: Map<string, IOB11NetworkAdapter> = new Map();

    async openAllAdapters() {
        return Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.open()));
    }

    async emitEvent(event: OB11EmitEventContent) {
        return Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.onEvent(event)));
    }

    async emitEvents(events: OB11EmitEventContent[]) {
        return Promise.all(events.map(event => this.emitEvent(event)));
    }

    async emitEventByName(names: string[], event: OB11EmitEventContent) {
        return Promise.all(names.map(name => {
            const adapter = this.adapters.get(name);
            if (adapter) {
                return adapter.onEvent(event);
            }
        }));
    }
    async emitEventByNames(map: Map<string, OB11EmitEventContent>) {
        return Promise.all(Array.from(map.entries()).map(([name, event]) => {
            const adapter = this.adapters.get(name);
            if (adapter) {
                return adapter.onEvent(event);
            }
        }));
    }
    registerAdapter(adapter: IOB11NetworkAdapter) {
        this.adapters.set(adapter.name, adapter);
    }

    async registerAdapterAndOpen(adapter: IOB11NetworkAdapter) {
        this.registerAdapter(adapter);
        await adapter.open();
    }

    async closeSomeAdapters(adaptersToClose: IOB11NetworkAdapter[]) {
        for (const adapter of adaptersToClose) {
            this.adapters.delete(adapter.name);
            await adapter.close();
        }
    }
    async closeSomeAdaterWhenOpen(adaptersToClose: IOB11NetworkAdapter[]) {
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

    async closeAdapterByPredicate(closeFilter: (adapter: IOB11NetworkAdapter) => boolean) {
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
}

export * from './active-http';
export * from './active-websocket';
export * from './passive-http';
export * from './passive-websocket';