import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';

export class OB11GroupBanEvent extends OB11GroupNoticeEvent {
    notice_type = 'group_ban';
    operator_id: number;
    duration: number;
    sub_type: 'ban' | 'lift_ban';

    constructor(groupId: number, userId: number, operatorId: number, duration: number, sub_type:  'ban' | 'lift_ban') {
        super();
        this.group_id = groupId;
        this.operator_id = operatorId;
        this.user_id = userId;
        this.duration = duration;
        this.sub_type = sub_type;
    }
}
