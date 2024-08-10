import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

export abstract class OB11GroupNoticeEvent extends OB11BaseNoticeEvent {
    group_id: number;
    user_id: number;

    constructor(core: NapCatCore, group_id: number, user_id: number) {
        super(core);
        this.group_id = group_id;
        this.user_id = user_id;
    }
}
