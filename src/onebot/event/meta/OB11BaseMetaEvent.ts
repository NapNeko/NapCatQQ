import { EventType, OneBotEvent } from '@/onebot/event/OneBotEvent';

export abstract class OB11BaseMetaEvent extends OneBotEvent {
    post_type = EventType.META;
    abstract meta_event_type: string;
}
