import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { NapCatCore } from '@/core';

type GroupIncreaseSubType = 'approve' | 'invite';

export class OB11GroupIncreaseEvent extends OB11GroupNoticeEvent {
    notice_type = 'group_increase';
    operator_id: number;
    sub_type: GroupIncreaseSubType;

    constructor(core: NapCatCore, groupId: number, userId: number, operatorId: number, subType: GroupIncreaseSubType = 'approve') {
        super(core, groupId, userId);
        this.group_id = groupId;
        this.operator_id = operatorId;
        this.user_id = userId;
        this.sub_type = subType;
    }
}
