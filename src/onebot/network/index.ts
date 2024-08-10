import BaseAction from '@/onebot/action/BaseAction';
import { OB11BaseEvent } from '@/onebot/event/OB11BaseEvent';

export interface IOB11NetworkAdapter {
    registerAction<T extends BaseAction<P, R>, P, R>(action: T): void;
    onEvent<T extends OB11BaseEvent>(event: T): void;
    open(): void | Promise<void>;
    close(): void | Promise<void>;
}
export class OB11NetworkManager {
    private adapters: IOB11NetworkAdapter[] = [];

    registerAdapter(adapter: IOB11NetworkAdapter) {
        this.adapters.push(adapter);
    }

    async open() {
        await Promise.all(this.adapters.map(adapter => adapter.open()));
    }

    async close() {
        await Promise.all(this.adapters.map(adapter => adapter.close()));
    }
}
export * from './active-http';
export * from './active-websocket';
export * from './passive-http';
export * from './passive-websocket';