import { EventType, OB11BaseEvent } from '../OB11BaseEvent';

export abstract class OB11BaseMetaEvent extends OB11BaseEvent {
    post_type = EventType.META;
    abstract meta_event_type: string;
}
