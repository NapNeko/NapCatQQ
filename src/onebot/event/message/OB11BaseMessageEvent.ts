import { EventType, OB11BaseEvent } from '../OB11BaseEvent';

export abstract class OB11BaseMessageEvent extends OB11BaseEvent {
  post_type = EventType.MESSAGE;
}