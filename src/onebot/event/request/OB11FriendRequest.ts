import { OB11BaseNoticeEvent } from '../notice/OB11BaseNoticeEvent';
import { EventType } from '../OB11BaseEvent';


export class OB11FriendRequestEvent extends OB11BaseNoticeEvent {
    post_type = EventType.REQUEST;
    user_id: number = 0;
    request_type = 'friend' as const;
    comment: string = '';
    flag: string = '';
}
