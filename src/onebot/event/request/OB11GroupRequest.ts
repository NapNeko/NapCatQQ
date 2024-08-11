import { OB11GroupNoticeEvent } from '../notice/OB11GroupNoticeEvent';
import { EventType } from '../OB11BaseEvent';
import { NapCatCore } from '@/core';

export class OB11GroupRequestEvent extends OB11GroupNoticeEvent {
    post_type = EventType.REQUEST;
    request_type = 'group';

    user_id: number;
    comment: string;
    flag: string;
    sub_type: string;

    constructor(core: NapCatCore, groupId: number, userId: number, sub_type: string, comment: string, flag: string) {
        super(core, groupId, userId);
        this.user_id = userId;
        this.sub_type = sub_type;
        this.comment = comment;
        this.flag = flag;
    }
}
