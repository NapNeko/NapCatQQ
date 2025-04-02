import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { NapCatCore } from '@/core';


export class GroupMemberTitle extends OB11GroupNoticeEvent {
    notice_type = 'title';
    sub_type: 'set' | 'unset' = 'set';
    title: string = '';

    constructor(core: NapCatCore, groupId: number, userId: number, title: string) {
        super(core, groupId, userId);
        this.group_id = groupId;
        this.user_id = userId;
        this.title = title;
    }
}
