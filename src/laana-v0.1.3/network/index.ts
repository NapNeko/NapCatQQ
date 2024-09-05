import { NapCatLaanaAdapter } from '@/laana-v0.1.3';
import { EventWrapper } from '@/laana-v0.1.3/types/event/wrapper';
import { randomUUID } from 'crypto';

export interface ILaanaNetworkAdapter {
    laana: NapCatLaanaAdapter;

    onEvent(event: EventWrapper): void;

    open(): void | Promise<void>;

    close(): void | Promise<void>;
}

export class LaanaNetworkManager {
    adapters: ILaanaNetworkAdapter[] = [];

    async openAllAdapters() {
        return Promise.all(this.adapters.map(adapter => adapter.open()));
    }

    emitEvent<T extends Exclude<EventWrapper['event']['oneofKind'], undefined>>(
        eventName: T,
        // eslint-disable-next-line
        // @ts-ignore
        event: Extract<EventWrapper['event'], { oneofKind: T }>[T]
    ) {
        return Promise.all(this.adapters.map(adapter => adapter.onEvent({
            time: BigInt(Date.now()),
            eventId: randomUUID(),
            // eslint-disable-next-line
            // @ts-ignore
            event: {
                oneofKind: eventName,
                [eventName]: event,
            },
        })));
    }

    registerAdapter(adapter: ILaanaNetworkAdapter) {
        this.adapters.push(adapter);
    }

    async registerAdapterAndOpen(adapter: ILaanaNetworkAdapter) {
        this.registerAdapter(adapter);
        await adapter.open();
    }

    async closeSomeAdapters(adaptersToClose: ILaanaNetworkAdapter[]) {
        this.adapters = this.adapters.filter(adapter => !adaptersToClose.includes(adapter));
        await Promise.all(adaptersToClose.map(adapter => adapter.close()));
    }
}
