import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

export class OB11ProfileLikeEvent extends OB11BaseNoticeEvent {
    notice_type = 'notify';
    sub_type = 'profile_like';
    operator_id: number;
    operator_nick: string;
    times: number;
    time: number;

    constructor(core: NapCatCore, operatorId: number, operatorNick: string, times: number, time: number) {
        super(core);
        this.operator_id = operatorId;
        this.operator_nick = operatorNick;
        this.times = times;
        this.time = time;
    }
}
