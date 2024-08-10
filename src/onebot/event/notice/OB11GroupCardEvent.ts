import { OB11GroupNoticeEvent } from './OB11GroupNoticeEvent';
import { NapCatCore } from '@/core';

export class OB11GroupCardEvent extends OB11GroupNoticeEvent {
    notice_type = 'group_card';
    card_new: string;
    card_old: string;


    constructor(core: NapCatCore, groupId: number, userId: number, cardNew: string, cardOld: string) {
        super(core);
        this.group_id = groupId;
        this.user_id = userId;
        this.card_new = cardNew;
        this.card_old = cardOld;
    }
}
