import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
export class OB11GroupEssenceEvent extends OB11GroupNoticeEvent {
    notice_type = 'group_essence';
    message_id: number;

    constructor(groupId: number, message_id: number) {
        super();
        this.group_id = groupId;
        this.message_id = message_id;
    }
}
