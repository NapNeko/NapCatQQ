import { selfInfo } from '@/core/data';

export enum EventType {
    META = 'meta_event',
    REQUEST = 'request',
    NOTICE = 'notice',
    MESSAGE = 'message',
    MESSAGE_SENT = 'message_sent',
}


export abstract class OB11BaseEvent {
    time = Math.floor(Date.now() / 1000);
    self_id = parseInt(selfInfo.uin);
    post_type: EventType = EventType.META;
}
