import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

export class OB11FriendAddNoticeEvent extends OB11BaseNoticeEvent {
    notice_type = 'friend_add';
    user_id: number;

    public constructor(core: NapCatCore, userId: number) {
        super(core);
        this.user_id = userId;
    }
}
