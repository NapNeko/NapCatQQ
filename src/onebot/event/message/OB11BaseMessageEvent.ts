import { EventType, OneBotEvent } from '@/onebot/event/OneBotEvent';

export abstract class OB11BaseMessageEvent extends OneBotEvent {
    post_type = EventType.MESSAGE;
}