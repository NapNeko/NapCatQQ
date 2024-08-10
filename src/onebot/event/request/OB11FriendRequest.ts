import { OB11BaseNoticeEvent } from '../notice/OB11BaseNoticeEvent';
import { EventType } from '../OB11BaseEvent';
import { NapCatCore } from '@/core';

export class OB11FriendRequestEvent extends OB11BaseNoticeEvent {
    post_type = EventType.REQUEST;
    request_type = 'friend';

    user_id: number;
    comment: string;
    flag: string;

    constructor(core: NapCatCore, user_id: number, comment: string, flag: string) {
        super(core);
        this.user_id = user_id;
        this.comment = comment;
        this.flag = flag;
    }
}
