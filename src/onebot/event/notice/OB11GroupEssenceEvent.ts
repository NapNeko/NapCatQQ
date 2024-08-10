import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { NapCatCore } from '@/core';

export class OB11GroupEssenceEvent extends OB11GroupNoticeEvent {
    notice_type = 'essence';
    message_id: number;
    sender_id: number;
    sub_type: 'add' | 'delete' = 'add';

    constructor(core: NapCatCore, groupId: number, message_id: number, sender_id: number) {
        super(core);
        this.group_id = groupId;
        this.message_id = message_id;
        this.sender_id = sender_id;
    }
}
