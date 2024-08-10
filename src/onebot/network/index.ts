import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';

export interface IOB11NetworkAdapter {
    registerAction<T extends BaseAction<P, R>, P, R>(action: T): void;

    onEvent<T extends OB11BaseEvent>(event: T): void;

    open(): void | Promise<void>;

    close(): void | Promise<void>;
}

export class OB11NetworkManager {
    adapters: IOB11NetworkAdapter[] = [];

    async getAllAdapters() {
        return this.adapters;
    }

    async PostEvent(event: OB11BaseEvent) {
        // Mlikiowa V2.0.0 Refactor Todo
        return Promise.all(this.adapters.map(adapter => adapter.onEvent(event)));
    }

    async registerAdapter(adapter: IOB11NetworkAdapter) {
        return this.adapters.push(adapter);
    }

    async closeSomeAdapters(adapters: IOB11NetworkAdapter[]) {
        this.adapters = this.adapters.filter(adapter => !adapters.includes(adapter));
        await Promise.all(adapters.map(adapter => adapter.close()));
    }

    async closeAllAdapters() {
        this.adapters = [];
        await Promise.all(this.adapters.map(adapter => adapter.close()));
    }
}

export * from './active-http';
export * from './active-websocket';
export * from './passive-http';
export * from './passive-websocket';
