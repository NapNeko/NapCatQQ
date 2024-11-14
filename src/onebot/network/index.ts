import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import { OB11Message } from '@/onebot';
import { ActionMap } from '@/onebot/action';

export type OB11EmitEventContent = OB11BaseEvent | OB11Message;

export interface IOB11NetworkAdapter {
    actions?: ActionMap;
    name: string;

    onEvent<T extends OB11EmitEventContent>(event: T): void;

    open(): void | Promise<void>;

    close(): void | Promise<void>;
}

export class OB11NetworkManager {
    adapters: Map<string, IOB11NetworkAdapter> = new Map();

    async openAllAdapters() {
        return Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.open()));
    }

    async emitEvent(event: OB11EmitEventContent) {
        return Promise.all(Array.from(this.adapters.values()).map(adapter => adapter.onEvent(event)));
    }

    async emitEventByName(names: string[], event: OB11EmitEventContent) {
        return Promise.all(names.map(name => {
            const adapter = this.adapters.get(name);
            if (adapter) {
                return adapter.onEvent(event);
            }
        }));
    }
    async emitEventByNames(map:Map<string,OB11EmitEventContent>){
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
}

export * from './active-http';
export * from './active-websocket';
export * from './passive-http';
export * from './passive-websocket';