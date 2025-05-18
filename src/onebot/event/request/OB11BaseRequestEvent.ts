import { EventType, OneBotEvent } from '../OneBotEvent';

export abstract class OB11BaseRequestEvent extends OneBotEvent {
    post_type = EventType.REQUEST;
    abstract request_type: string;
}
