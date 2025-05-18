import { EventType, OneBotEvent } from '@/onebot/event/OneBotEvent';

export abstract class OB11BaseNoticeEvent extends OneBotEvent {
    post_type = EventType.NOTICE;
    abstract notice_type: string;
}
