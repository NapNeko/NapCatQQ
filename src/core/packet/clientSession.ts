import { PacketContext } from '@/core/packet/context/packetContext';
import { NapCatCore } from '@/core';

export class PacketClientSession {
    private readonly context: PacketContext;

    constructor(core: NapCatCore) {
        this.context = new PacketContext(core);
    }

    init(pid: number, recv: string, send: string): Promise<void> {
        return this.context.client.init(pid, recv, send);
    }

    get clientLogStack() {
        return this.context.client.clientLogStack;
    }

    get available() {
        return this.context.client.available;
    }

    get operation() {
        return this.context.operation;
    }

    // TODO: global message element adapter (?
    get msgConverter() {
        return this.context.msgConverter;
    }
}
