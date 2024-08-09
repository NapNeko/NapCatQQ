import { EventType, OB11BaseEvent } from '../OB11BaseEvent';

export abstract class OB11BaseNoticeEvent extends OB11BaseEvent {
  post_type = EventType.NOTICE;
}