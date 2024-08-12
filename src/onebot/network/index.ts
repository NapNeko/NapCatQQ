import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import { OB11Message } from '@/onebot';
import { ActionMap } from '@/onebot/action';

export type OB11EmitEventContent = OB11BaseEvent | OB11Message;

export interface IOB11NetworkAdapter {
    actions?: ActionMap;

    onEvent<T extends OB11EmitEventContent>(event: T): void;

    open(): void | Promise<void>;

    close(): void | Promise<void>;
}

export class OB11NetworkManager {
    adapters: IOB11NetworkAdapter[] = [];

    async openAllAdapters() {
        return Promise.all(this.adapters.map(adapter => adapter.open()));
    }

    async emitEvent(event: OB11EmitEventContent) {
        //console.log('adapters', this.adapters.length);
        return Promise.all(this.adapters.map(adapter => adapter.onEvent(event)));
    }

    registerAdapter(adapter: IOB11NetworkAdapter) {
        this.adapters.push(adapter);
    }

    async registerAdapterAndOpen(adapter: IOB11NetworkAdapter) {
        this.registerAdapter(adapter);
        await adapter.open();
    }

    async closeSomeAdapters(adaptersToClose: IOB11NetworkAdapter[]) {
        this.adapters = this.adapters.filter(adapter => !adaptersToClose.includes(adapter));
        await Promise.all(adaptersToClose.map(adapter => adapter.close()));
    }

    /**
     * Close all adapters that satisfy the predicate.
     */
    async closeAdapterByPredicate(closeFilter: (adapter: IOB11NetworkAdapter) => boolean) {
        await this.closeSomeAdapters(this.adapters.filter(closeFilter));
    }

    async closeAllAdapters() {
        await Promise.all(this.adapters.map(adapter => adapter.close()));
        this.adapters = [];
    }
}

export * from './active-http';
export * from './active-websocket';
export * from './passive-http';
export * from './passive-websocket';
