import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';
import { OB11Message } from '@/onebot';

export type OB11EmitEventContent = OB11BaseEvent | OB11Message;

export interface IOB11NetworkAdapter {
    registerAction<T extends BaseAction<P, R>, P, R>(action: T): void;

    registerActionMap(actionMap: Map<string, BaseAction<any, any>>): void;

    onEvent<T extends OB11EmitEventContent>(event: T): void;

    open(): void | Promise<void>;

    close(): void | Promise<void>;
}

export class OB11NetworkManager {
    adapters: IOB11NetworkAdapter[] = [];

    async getAllAdapters() {
        return this.adapters;
    }

    async openAllAdapters() {
        return Promise.all(this.adapters.map(adapter => adapter.open()));
    }

    async registerAllActions(actions: Map<string, BaseAction<any, any>>) {
        return Promise.all(this.adapters.map(adapter => adapter.registerActionMap(actions)));
    }

    async emitEvent(event: OB11EmitEventContent) {
        console.log('adapters', this.adapters.length);
        return Promise.all(this.adapters.map(adapter => adapter.onEvent(event)));
    }

    async registerAdapter(adapter: IOB11NetworkAdapter) {
        console.log('Registering adapter:', adapter);
        this.adapters.push(adapter);
        console.log('Current adapters:', this.adapters.length);
    }

    async closeSomeAdapters(adapters: IOB11NetworkAdapter[]) {
        this.adapters = this.adapters.filter(adapter => !adapters.includes(adapter));
        await Promise.all(adapters.map(adapter => adapter.close()));
    }

    async closeAllAdapters() {
        console.log('Closing all adapters');
        await Promise.all(this.adapters.map(adapter => adapter.close()));
        this.adapters = [];
        console.log('All adapters closed. Current adapters:', this.adapters.length);
    }
}

export * from './active-http';
export * from './active-websocket';
export * from './passive-http';
export * from './passive-websocket';
