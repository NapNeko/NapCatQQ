import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { NapCatCore } from '@/core';

export class OB11GroupNameEvent extends OB11GroupNoticeEvent {
    notice_type = 'notify';
    sub_type = 'group_name';
    name_new: string;

    constructor(core: NapCatCore, groupId: number, userId: number, nameNew: string) {
        super(core, groupId, userId);
        this.name_new = nameNew;
    }
}
