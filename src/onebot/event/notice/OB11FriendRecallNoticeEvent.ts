import { OB11BaseNoticeEvent } from './OB11BaseNoticeEvent';
import { NapCatCore } from '@/core';

export class OB11FriendRecallNoticeEvent extends OB11BaseNoticeEvent {
    notice_type = 'friend_recall';
    user_id: number;
    message_id: number;

    public constructor(core: NapCatCore, userId: number, messageId: number) {
        super(core);
        this.user_id = userId;
        this.message_id = messageId;
    }
}
