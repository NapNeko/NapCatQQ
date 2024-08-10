import { InstanceContext, NapCatCore } from '@/core';

export enum EventType {
    META = 'meta_event',
    REQUEST = 'request',
    NOTICE = 'notice',
    MESSAGE = 'message',
    MESSAGE_SENT = 'message_sent',
}

export abstract class OB11BaseEvent {
    time = Math.floor(Date.now() / 1000);
    self_id: number;
    abstract post_type: EventType;

    constructor(core: NapCatCore) {
        this.self_id = parseInt(core.selfInfo.uin);
    }
}
