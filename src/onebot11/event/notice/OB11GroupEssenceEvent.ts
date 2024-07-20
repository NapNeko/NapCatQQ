import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
export class OB11GroupEssenceEvent extends OB11GroupNoticeEvent {
    notice_type = 'essence';
    message_id: number;
    sub_type: 'add' | 'delete' = "add";

    constructor(groupId: number, message_id: number) {
        super();
        this.group_id = groupId;
        this.message_id = message_id;
    }
}
