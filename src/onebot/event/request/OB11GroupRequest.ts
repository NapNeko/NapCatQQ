import { OB11GroupNoticeEvent } from '../notice/OB11GroupNoticeEvent';
import { EventType } from '../OB11BaseEvent';
import { NapCatCore } from '@/core';

export class OB11GroupRequestEvent extends OB11GroupNoticeEvent {
    post_type = EventType.REQUEST;
    request_type = 'group';

    user_id: number;
    comment: string;
    flag: string;

    constructor(core: NapCatCore, groupId: number, userId: number, comment: string, flag: string) {
        super(core, groupId, userId);
        this.user_id = userId;
        this.comment = comment;
        this.flag = flag;
    }
}
