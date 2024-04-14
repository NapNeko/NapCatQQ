import { OB11GroupNoticeEvent } from '../notice/OB11GroupNoticeEvent';
import { EventType } from '../OB11BaseEvent';


export class OB11GroupRequestEvent extends OB11GroupNoticeEvent {
  post_type = EventType.REQUEST;
  request_type = 'group' as const;
  sub_type: 'add' | 'invite' = 'add';
  comment: string = '';
  flag: string = '';
}
