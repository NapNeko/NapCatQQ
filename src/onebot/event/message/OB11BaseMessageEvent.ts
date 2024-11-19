import { EventType, OneBotEvent } from '../OneBotEvent';

export abstract class OB11BaseMessageEvent extends OneBotEvent {
    post_type = EventType.MESSAGE;
}